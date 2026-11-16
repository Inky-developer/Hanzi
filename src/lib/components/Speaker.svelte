<script lang="ts">
	import { Volume as VolumeIcon, Volume2 as Volume2Icon } from '@lucide/svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	const {
		text,
		class: extraClass,
		...props
	}: { text: string } & HTMLAttributes<HTMLElement> = $props();

	let speaking = $state(false);
	const Icon = $derived(speaking ? Volume2Icon : VolumeIcon);

	const speak = (): void => {
		const synth = window.speechSynthesis;
		// The dot helps with fade out
		const utterance = new SpeechSynthesisUtterance(text + '。');
		utterance.lang = 'zh-CN';
		utterance.rate = 0.25;
		utterance.onend = () => {
			speaking = false;
		};
		synth.cancel();
		speaking = true;
		synth.speak(utterance);
	};
</script>

<button onclick={speak} class={[speaking && 'motion-safe:animate-pulse', extraClass]} {...props}>
	<Icon class="hover:scale-125 motion-safe:transition-transform" />
</button>
