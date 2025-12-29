import { useCallback, useRef, useState } from "react";

export interface TypewriterChange {
	originalStart: number;
	originalEnd: number;
	oldText: string;
	newText: string;
}

interface TypewriterState {
	isAnimating: boolean;
	currentCode: string;
}

interface UseTypewriterAnimationOptions {
	/** Speed in ms per character for erasing */
	eraseSpeed?: number;
	/** Speed in ms per character for typing */
	typeSpeed?: number;
	/** Callback when animation completes with final code */
	onComplete?: (code: string) => void;
}

export function useTypewriterAnimation(
	options: UseTypewriterAnimationOptions = {},
) {
	const { eraseSpeed = 1, typeSpeed = 1, onComplete } = options;

	const [state, setState] = useState<TypewriterState>({
		isAnimating: false,
		currentCode: "",
	});

	const animationRef = useRef<{ cancelled: boolean }>({ cancelled: false });

	const animate = useCallback(
		(originalCode: string, finalCode: string, change: TypewriterChange) => {
			// Cancel any running animation
			animationRef.current.cancelled = true;
			animationRef.current = { cancelled: false };
			const currentAnimation = animationRef.current;

			setState({ isAnimating: true, currentCode: originalCode });

			const { originalStart, originalEnd, oldText, newText } = change;

			// Calculate positions
			const prefix = originalCode.slice(0, originalStart);
			const suffix = originalCode.slice(originalEnd);

			let currentOldIndex = oldText.length;
			let currentNewIndex = 0;

			// Phase 1: Erase the old text character by character
			const eraseInterval = setInterval(() => {
				if (currentAnimation.cancelled) {
					clearInterval(eraseInterval);
					return;
				}

				if (currentOldIndex > 0) {
					currentOldIndex--;
					const partialOld = oldText.slice(0, currentOldIndex);
					setState({
						isAnimating: true,
						currentCode: prefix + partialOld + suffix,
					});
				} else {
					clearInterval(eraseInterval);

					// Phase 2: Type the new text character by character
					const typeInterval = setInterval(() => {
						if (currentAnimation.cancelled) {
							clearInterval(typeInterval);
							return;
						}

						if (currentNewIndex < newText.length) {
							currentNewIndex++;
							const partialNew = newText.slice(0, currentNewIndex);
							setState({
								isAnimating: true,
								currentCode: prefix + partialNew + suffix,
							});
						} else {
							clearInterval(typeInterval);
							setState({ isAnimating: false, currentCode: finalCode });
							onComplete?.(finalCode);
						}
					}, typeSpeed);
				}
			}, eraseSpeed);
		},
		[eraseSpeed, typeSpeed, onComplete],
	);

	const cancel = useCallback(() => {
		animationRef.current.cancelled = true;
		setState((prev) => ({ ...prev, isAnimating: false }));
	}, []);

	return {
		isAnimating: state.isAnimating,
		currentCode: state.currentCode,
		animate,
		cancel,
	};
}
