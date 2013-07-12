#strider-custom

Support for custom prepare, test and deploy phases in Strider


## Add Scripts within the Strider Configure Pane


## Add a strider-custom.json to your project

Create your `strider-custom.json` in the root directory of your project.

### Configuration options

- **prepare**: custom shell command to run when preparing the project. A non-zero exit results in failure.
- **test**: custom shell command to run the tests. A non-zero exit results in failure.
- **deploy**: custom shell command to run to deploy the project.

#### Example:

```json
{
  "prepare": "echo executed prepare statement!",
  "test": "echo executed deploy statement!",
  "deploy": "echo deploy && git push heroku master --force"
}
```
