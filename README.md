# strider-custom

Support for custom environment, prepare, test, deploy and cleanup phases in Strider

[![NPM](https://nodei.co/npm/strider-custom.png?downloads=true&stars=true)](https://nodei.co/npm/strider-custom/)

## Using strider.json

This plugin also supports using a `strider.json` in your project.

It can have the following properties, but you can pick and choose which you want to use.

```json
{
  "environment": "# type shell commands here",
  "prepare": "# type shell commands here",
  "test": "# type shell commands here",
  "deploy": "# type shell commands here",
  "cleanup": "# type shell commands here"
}
```
