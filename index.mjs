#!/usr/bin/env node
import fs from 'fs';
import { $, cd, quiet } from 'zx';
import chalk from 'chalk';

// 需要更新的项目列表路径
const projectPaths = [
    'Projects/code/Toolbar',
    'Projects/code/Admin'
];
// 需要更新的分支
const branch = 'feature/package_upgrade';
// 需要更新的包名
const libName = '@code/venus';
// 需要更新的版本
const libVersion = '1.5.2';

for (const path of projectPaths) {
    cd(path);
    await quiet($`git stash`);
    await quiet($`git clean -fd`);
    await quiet($`git fetch origin ${branch}`);
    await quiet($`git checkout ${branch}`);
    let packageStr = fs.readFileSync('./package.json', 'utf8');
    packageStr = packageStr.replace(new RegExp(`"${libName}": ".*"`, 'gm'), `"${libName}": "${libVersion}"`);
    fs.writeFileSync('./package.json', packageStr);
    const { stdout: stdoutStatus } = await quiet($`git status`);
    if (!stdoutStatus.includes('nothing to commit')) {
        await quiet($`git add package.json`);
        await quiet($`git commit -m "feat: update ${libName} to ${libVersion}"`);
        await quiet($`git push origin ${branch}`);
    }
    const { stdout: stdoutRemote } = await quiet($`git remote get-url --all origin`);
    const repo = /(github\.com:?.*)\.git/.exec(stdoutRemote)[1];
    console.log(chalk.blue(`https://${repo}/-/merge_requests/new?change_branches=true&merge_request[source_branch]=${branch}&merge_request[target_branch]=master`));
}


