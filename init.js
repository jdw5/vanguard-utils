#!/usr/bin/env node

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

/** Write a blank line if terminated */
rl.on('close', () => {
	console.log('');
});

let responses = {
	name: {
		question: 'Please enter a name for your project: ',
		val: null,
		replaces: 'package_name'
	},
	title: {
		question: 'Please enter a title for your project: ',
		val: null,
		replaces: 'package_title'
	},
	description: {
		question: 'Please enter a description for your project: ',
		val: null,
		replaces: 'package_description'
	},
	author: {
		question: 'Please enter your author name: ',
		val: null,
		replaces: 'package_author'
	},
	username: {
		question: 'Please enter the your (Github) username: ',
		val: null,
		replaces: 'package_username'
	}
}

const replaceInFile = (filePath, value, match) => {
	const content = fs.readFileSync(filePath, 'utf8');
	const newContent = content.replace(new RegExp(`:${match}`, 'g'), value);
	fs.writeFileSync(filePath, newContent, 'utf8');
};

const replaceInDir = (dirPath, value, match) => {
	const files = fs.readdirSync(dirPath);
	for (const file of files) {
	  if (file === '.git') continue;
	  if (file === 'node_modules') continue;
	  const filePath = path.join(dirPath, file);
	  const stat = fs.statSync(filePath);
	  if (stat.isFile()) replaceInFile(filePath, value, match);
	  else if (stat.isDirectory()) replaceInDir(filePath, value, match);
	}
};

// Loop over the responses object and prompt the user for each value
for (const key in responses) {
	const response = responses[key];
	responses[key].val = await new Promise((resolve) => {
		const prompt = () => {
			rl.question(response.question, (answer) => {
				if (answer.trim() === '') {
					console.warn('	Input cannot be empty. Please provide a valid input.');
					prompt();
				} else {
					resolve(answer);
				}
			});
		}
		prompt();
	});
}

console.log('\nUpdating files...')

for (const key in responses) {
	const response = responses[key];
	replaceInDir(process.cwd(), response.val, response.replaces);
}

fs.unlinkSync('./init.js');

const packageJsonPath = path.join('./package.json');
const packageJsonData = fs.readFileSync(packageJsonPath, 'utf-8');
const packageJson = JSON.parse(packageJsonData);
delete packageJson.scripts.init;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

rl.close()