import lineReader from 'line-reader';

export default async (fileName: string, onLine: (line: string) => void): Promise<void> =>
	new Promise((resolve, reject) => {
		lineReader.eachLine(
			fileName,
			(line, last) => {
				onLine(line);
				if (last) resolve();
				return true;
			},
			(err) => {
				if (err) reject(err);
			}
		);
	});
