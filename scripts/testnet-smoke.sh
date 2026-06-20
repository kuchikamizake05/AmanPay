#!/usr/bin/env bash
set -euo pipefail

NETWORK="testnet"
WASM="target/wasm32v1-none/release/amanpay_escrow.wasm"
ADMIN="amanpay-admin"
BUYER="amanpay-buyer"
SELLER="amanpay-seller"
RESOLVER="amanpay-resolver"
ISSUER="amanpay-usdc-issuer"
TX_LOG="$(mktemp)"
trap 'rm -f "$TX_LOG"' EXIT

ensure_identity() {
  local name="$1"
  if ! stellar keys public-key "$name" >/dev/null 2>&1; then
    stellar keys generate "$name" --network "$NETWORK" --fund >/dev/null
  else
    stellar keys fund "$name" --network "$NETWORK" >/dev/null
  fi
}

capture() {
  local output
  output=$("$@" 2> >(tee -a "$TX_LOG" >&2))
  printf '%s' "$output"
}

ensure_sac() {
  local asset="$1"
  local source="$2"
  local alias="$3"
  local contract_id
  contract_id=$(stellar contract id asset --asset "$asset" --network "$NETWORK")
  if ! stellar contract info interface \
    --contract-id "$contract_id" \
    --network "$NETWORK" >/dev/null 2>&1; then
    capture stellar contract asset deploy \
      --asset "$asset" \
      --source "$source" \
      --network "$NETWORK" \
      --alias "$alias" >/dev/null
  fi
  printf '%s' "$contract_id"
}

invoke() {
  local contract_id="$1"
  local source="$2"
  shift 2
  capture stellar contract invoke \
    --id "$contract_id" \
    --source "$source" \
    --network "$NETWORK" \
    -- "$@"
}

echo "==> Building AmanPay contract"
stellar contract build >/dev/null

echo "==> Preparing funded testnet identities"
for identity in "$ADMIN" "$BUYER" "$SELLER" "$RESOLVER" "$ISSUER"; do
  ensure_identity "$identity"
done

ADMIN_ADDRESS=$(stellar keys public-key "$ADMIN")
BUYER_ADDRESS=$(stellar keys public-key "$BUYER")
SELLER_ADDRESS=$(stellar keys public-key "$SELLER")
RESOLVER_ADDRESS=$(stellar keys public-key "$RESOLVER")
ISSUER_ADDRESS=$(stellar keys public-key "$ISSUER")
USDC_ASSET="USDC:${ISSUER_ADDRESS}"

echo "==> Preparing native XLM SAC"
XLM_SAC=$(ensure_sac native "$ADMIN" amanpay-xlm)

echo "==> Issuing mock USDC and preparing trustlines"
stellar tx new change-trust \
  --source "$BUYER" \
  --line "$USDC_ASSET" \
  --network "$NETWORK" >/dev/null
stellar tx new change-trust \
  --source "$SELLER" \
  --line "$USDC_ASSET" \
  --network "$NETWORK" >/dev/null
stellar tx new payment \
  --source "$ISSUER" \
  --destination "$BUYER_ADDRESS" \
  --asset "$USDC_ASSET" \
  --amount 1000000000 \
  --network "$NETWORK" >/dev/null

USDC_SAC=$(ensure_sac "$USDC_ASSET" "$ISSUER" amanpay-usdc)

echo "==> Deploying AmanPay escrow"
CONTRACT_ID=$(capture stellar contract deploy \
  --wasm "$WASM" \
  --source "$ADMIN" \
  --network "$NETWORK" \
  --alias amanpay-escrow \
  -- \
  --admin "$ADMIN_ADDRESS")

invoke "$CONTRACT_ID" "$ADMIN" set_asset_enabled \
  --asset "$XLM_SAC" --enabled true >/dev/null
invoke "$CONTRACT_ID" "$ADMIN" set_asset_enabled \
  --asset "$USDC_SAC" --enabled true >/dev/null

NOW=$(date +%s)
DEADLINE=$((NOW + 3600))
TERMS_XLM="1111111111111111111111111111111111111111111111111111111111111111"
DELIVERY_XLM="2222222222222222222222222222222222222222222222222222222222222222"
TERMS_USDC="3333333333333333333333333333333333333333333333333333333333333333"
DELIVERY_USDC="4444444444444444444444444444444444444444444444444444444444444444"

run_deal() {
  local label="$1"
  local asset="$2"
  local amount="$3"
  local terms_hash="$4"
  local delivery_hash="$5"

  echo "==> Running ${label} deal"
  local buyer_before seller_before deal_id buyer_after seller_after contract_after deal
  buyer_before=$(invoke "$asset" "$ADMIN" balance --id "$BUYER_ADDRESS")
  seller_before=$(invoke "$asset" "$ADMIN" balance --id "$SELLER_ADDRESS")
  buyer_before=${buyer_before//\"/}
  seller_before=${seller_before//\"/}

  deal_id=$(invoke "$CONTRACT_ID" "$SELLER" create_deal \
    --deal-type Service \
    --seller "$SELLER_ADDRESS" \
    --buyer "$BUYER_ADDRESS" \
    --resolver "$RESOLVER_ADDRESS" \
    --asset "$asset" \
    --amount "$amount" \
    --terms-hash "$terms_hash" \
    --delivery-deadline "$DEADLINE" \
    --review-period 300 \
    --revision-limit 1 \
    --revision-period 600)
  invoke "$CONTRACT_ID" "$BUYER" fund_deal --id "$deal_id" >/dev/null
  invoke "$CONTRACT_ID" "$SELLER" submit_delivery \
    --id "$deal_id" --delivery-hash "$delivery_hash" >/dev/null
  invoke "$CONTRACT_ID" "$BUYER" approve_release --id "$deal_id" >/dev/null

  deal=$(invoke "$CONTRACT_ID" "$ADMIN" get_deal --id "$deal_id")
  buyer_after=$(invoke "$asset" "$ADMIN" balance --id "$BUYER_ADDRESS")
  seller_after=$(invoke "$asset" "$ADMIN" balance --id "$SELLER_ADDRESS")
  contract_after=$(invoke "$asset" "$ADMIN" balance --id "$CONTRACT_ID")
  buyer_after=${buyer_after//\"/}
  seller_after=${seller_after//\"/}
  contract_after=${contract_after//\"/}

  if [[ "$deal" != *'Released'* ]]; then
    echo "Smoke test failed: ${label} deal did not reach Released" >&2
    exit 1
  fi
  if (( contract_after != 0 )); then
    echo "Smoke test failed: ${label} contract retained escrow funds" >&2
    exit 1
  fi
  if [[ "$label" == "XLM" ]]; then
    # Native XLM deltas include transaction/resource fees paid by each actor.
    if (( seller_after <= seller_before || seller_after - seller_before > amount )); then
      echo "Smoke test failed: XLM seller delta is outside the fee-adjusted range" >&2
      exit 1
    fi
    if (( buyer_before - buyer_after < amount || buyer_before - buyer_after >= amount * 2 )); then
      echo "Smoke test failed: XLM buyer delta is outside the fee-adjusted range" >&2
      exit 1
    fi
  else
    if (( seller_after - seller_before != amount )); then
      echo "Smoke test failed: ${label} seller balance delta is incorrect" >&2
      exit 1
    fi
    if (( buyer_before - buyer_after != amount )); then
      echo "Smoke test failed: ${label} buyer balance delta is incorrect" >&2
      exit 1
    fi
  fi

  echo "${label}_DEAL_ID=${deal_id}"
  echo "${label}_BUYER_BALANCE=${buyer_before}->${buyer_after}"
  echo "${label}_SELLER_BALANCE=${seller_before}->${seller_after}"
  echo "${label}_CONTRACT_BALANCE=${contract_after}"
}

run_deal "XLM" "$XLM_SAC" 10000000 "$TERMS_XLM" "$DELIVERY_XLM"
run_deal "USDC" "$USDC_SAC" 50000000 "$TERMS_USDC" "$DELIVERY_USDC"

echo
echo "AMANPAY_CONTRACT_ID=${CONTRACT_ID}"
echo "XLM_SAC_ID=${XLM_SAC}"
echo "USDC_SAC_ID=${USDC_SAC}"
echo "TRANSACTION_HASHES="
grep -Eo 'Signing transaction: [0-9a-f]{64}' "$TX_LOG" | awk '{print $3}' | sort -u || true
echo "Smoke test complete: both deals settled successfully."
