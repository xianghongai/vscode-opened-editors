// https://github.com/gko/wrap
import { workspace } from "vscode";

const userPattern = (text: string, wrapPattern: string) => {
	const escapedPattern = wrapPattern.replace(/`/g, "\\`");

	try {
		/* tslint:disable:no-eval */
		const templateFunction = eval(`(text) => \`${escapedPattern}\``);
		/* tslint:enable */

		return templateFunction(text);
	} catch {
		// TODO return predefined pattern
	}
};

const wrap = (text: string, pattern: string) => {
	const userPatterns = workspace.getConfiguration("wrapSelection.patterns");
	const isUserDefined = userPatterns.hasOwnProperty(pattern);

	if (isUserDefined) {
		return userPattern(text, userPatterns[pattern]);
	}

	switch (pattern) {
		case "“": case "”": return `“${text}”`;
		case "‘": case "’": return `‘${text}’`;
		case "〈": case "〉": return `〈${text}〉`;
		case "《": case "》": return `《${text}》`;

		default: return `${pattern}${text}${pattern}`;
	}
};

export default wrap;
