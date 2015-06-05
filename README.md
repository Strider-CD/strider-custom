# strider-custom

Support for custom environment, prepare, test, deploy and cleanup phases in Strider

[![NPM](https://nodei.co/npm/strider-custom.png?downloads=true&stars=true)](https://nodei.co/npm/strider-custom/)

## Using configuration information in your script
You can access any information relating to the current [job](https://github.com/Strider-CD/strider/blob/e578696039b96c55428864bc011985bf63b9385b/lib/models/job.js#L41), by using EJS syntax in your script.

A common example would be retrieving the name of the branch that is currently being built:

```shell
echo Deploying <%= ref.branch %>…
.scripts/deploy.sh <%= ref.branch %>
```

## Using `strider.json`
This plugin also supports being configured using the `strider.json` file in your project.

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

A more complete example of a `strider.json` would be:

```json
{
	"plugins": [
		{
			"id": "node",
			"enabled": true,
			"showStatus": true,
			"config": {
				"test": "npm test",
				"caching": "strict",
				"runtime": "whatever",
				"fork": "Node.js"
			}
		},
		{
			"id": "custom",
			"enabled": true,
			"showStatus": true,
			"config": {
				"prepare": ".scripts/prepare.sh --<%= ref.branch %>",
				"deploy": ".scripts/deploy.sh --<%= ref.branch %>"
			}
		}
	]
}
```