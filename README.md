Uses the Web Bluetooth API to collect data from a Schwinn IC4, upload it to Google Fit,
and visualize it with D3!

## Background

When I started this project, it was just a tool for myself. It's very specific
to me, my fitness goals, and the Schwinn IC4.

But now others are using this code, and that's awesome! I'd welcome any
contributions if folks want to push this app toward something more configurable
and universal.

## Development

This is built on https://github.com/facebook/create-react-app. `yarn install` and
`yarn start` should be enough to get you going, but the create-react-app docs have
more detailed instructions if you need them.

## Deployment

The quickest way to deploy is to create a Netlify account at https://www.netlify.com/.
Then fork this repo and connect it to your Netlify account.

After that, set up a new client id at https://developers.google.com/identity/sign-in/web/sign-in.
Then create an environment variable called `GOOGLE_SIGN_IN_CLIENT_ID` and set it to
your new client id.
