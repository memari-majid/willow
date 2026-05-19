/** Cheap regex prescreen — skip Haiku when the user is not adjusting tone. */
const PREFERENCE_INTENT =
  /\b(more direct|less direct|directer|less clinical|too clinical|slow down|speed up|formal|casual|stop being|don't talk about|do not talk about|avoid talking|pronoun|call me|your tone|speak more|speak less|hedging|warm(er)?|cold(er)?)\b/i;

export function mightContainPreferenceSignal(userMessage: string): boolean {
  return PREFERENCE_INTENT.test(userMessage.trim());
}
