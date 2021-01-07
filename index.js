#!/usr/bin/env node

const { program } = require('commander');
const packageJson = require('./package.json');
const inquirer = require('inquirer');
const download = require('download-git-repo');
const fs = require('fs');
const { exec } = require('child_process');
const ora = require('ora');
const loading = ora('Loading unicorns');
const logSymbols = require('log-symbols');
const semver = require('semver');
const {checkTime} = require('./util');
const path = require('path');

const LANG_LIST = {
    typescript: 'typescript',
    javascript: 'javascript',
  };

const downloadAdress = lang => `KevinMaKai/jeffrey-react-cli-template#${LANG_LIST[lang]}`;



program.version(packageJson.version), '-v, --version';

const downloadCallback = async(answer,err)=>{
    loading.stop();

    if(err){
        console.log(logSymbols.error,'我好像遇到问题了',err);
        return;
    }

    console.log(logSymbols.success,  '项目创建成功！');

    const filename = `${answer.name}/package.json`;
    if(fs.existsSync(filename)){
        let newPagJson = fs.readFileSync(filename).toString();
        newPagJson = JSON.parse(newPagJson);
        newPagJson = {...newPagJson, ...answer};
        newPagJson = JSON.stringify(newPagJson, null, '\t');
        fs.writeFileSync(filename,newPagJson);

        loading.color = 'green';
        loading.text = '正在疯狂为你拉node_modules';
        loading.start();

        const pullNodeModules = new Promise((res) => {
            process.chdir(path.join(process.cwd(), answer.name));
            exec('npm i',()=>{
                res(1);
            });
        });

        await pullNodeModules;

        loading.stop();
        console.log(answer.name);
        console.log(logSymbols.success,'安装成功！！！');
        console.log(`
        `);
        console.log(logSymbols.info,`first step: $ cd ${answer.name}`);
        // console.log(logSymbols.info,`first step: $ cd ${answer.name}`.blue);
        console.log(logSymbols.info,`second step: npm run dev`);
        console.log(`
        `);
    } else {
        console.log(logSymbols.error,'It happens error');
    }
};


program
    .command('init')
    .description('初始化项目')
    .action(async()=>{
        const checkResult = checkTime();

        if(checkResult && semver.gt(checkResult, packageJson.version)){
            console.log(
                logSymbols.error,
                `当前版本过低，请及时更新版本至${checkResult}`
            );

            process.exit(1);
        }
        const answer = await inquirer.prompt([
            {
                type:'input',
                name:'name',
                message:'请输入项目名称',
            },
            {
                type:'input',
                name:'author',
                message:'请输入项目作者名称',
            },
            {
                type:'input',
                name:'description',
                message:'请输入项目描述',
            },
            {
                type:'list',
                message:'请选择开发语言',
                name:'lang',
                choices:['typescript','javascript'],
            },
        ]);
   

        download(
            downloadAdress(answer.lang),
            `./${answer.name}`,
            downloadCallback.bind(null,answer)
        );

        loading.color = 'green';
        loading.text = '我正在疯狂为你加载中';
        loading.start();
    });

program.on('command:*',function(){
    console.log('请输入help查阅指令');
    process.exit(1);
})

program.parse(process.argv);

