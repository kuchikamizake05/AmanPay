import { fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InteractiveBackdrop } from "./interactive-backdrop";

describe("InteractiveBackdrop", () => {
  afterEach(() => vi.restoreAllMocks());

  it("updates decorative position after pointer movement", () => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));

    const { container } = render(<InteractiveBackdrop />);
    fireEvent.pointerMove(window, { clientX: 200, clientY: 100 });

    const backdrop = container.firstElementChild as HTMLElement;
    expect(backdrop).toHaveAttribute("aria-hidden", "true");
    expect(backdrop.style.getPropertyValue("--pointer-x")).not.toBe("");
    expect(backdrop.style.getPropertyValue("--pointer-y")).not.toBe("");
  });
});
