
# Deploying Adminity to AWS Amplify (Development Environment)

This guide provides instructions for deploying the Adminity Next.js application to AWS Amplify for a development environment.

## Prerequisites

1.  **AWS Account**: You need an active AWS account.
2.  **Amplify CLI**: Install and configure the Amplify CLI.
    ```bash
    npm install -g @aws-amplify/cli
    amplify configure
    ```
    Follow the prompts to connect the CLI to your AWS account.
3.  **Project Code**: Ensure you have the Adminity project code locally.
4.  **n8n Chat Webhook URL (Optional)**: If you plan to use the n8n chat widget, have your n8n chat webhook URL ready.

## Deployment Steps

### 1. Initialize Amplify in your Project

Navigate to the root directory of your Adminity project in your terminal and run:

```bash
amplify init
```

You'll be prompted to configure your project. Here are some typical responses for a development environment:

*   **Enter a name for the project**: `adminitydev` (or a similar unique name)
*   **Enter a name for the environment**: `dev`
*   **Choose your default editor**: Select your preferred editor.
*   **Choose the type of app that you're building**: `javascript`
*   **What javascript framework are you using**: `react` (Amplify's Next.js support is robust, but 'react' is a common initial choice here)
*   **Source Directory Path**: `src`
*   **Distribution Directory Path**: `.next` (This is crucial for Next.js App Router deployments)
*   **Build Command**: `npm run build`
*   **Start Command**: `npm run start` (Amplify will use its own compute for Next.js, but this is good for local consistency)
*   **Do you want to use an AWS profile?**: Yes, and select the profile you configured.

Amplify will set up the necessary backend resources and configuration files in AWS.

### 2. Add Amplify Hosting

Next, add hosting to your project:

```bash
amplify add hosting
```

Choose the following options:

*   **Select the plugin module to execute**: `Hosting with Amplify Console (Managed hosting with custom domains, Continuous deployment)`
*   **Choose a type**:
    *   `Continuous deployment (Git-based deployments)`: Recommended for development. Connect to your Git provider (GitHub, GitLab, Bitbucket, etc.) and select your development branch.
    *   `Manual deployment`: If you prefer to push updates manually from the CLI.

If you choose **Continuous deployment**, Amplify will guide you through connecting your Git repository.

### 3. Configure Build Settings (amplify.yml)

Amplify uses an `amplify.yml` file to define build settings. If you connected a Git repository, Amplify Console will attempt to auto-detect your settings. It's good to verify or create/customize this file in the root of your project.

A typical `amplify.yml` for a Next.js (App Router) application like Adminity:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci # Use 'npm ci' for faster, more reliable installs from package-lock.json
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next # Points to the output of the Next.js build
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/* # Cache dependencies
      - .next/cache/**/*  # Cache Next.js build artifacts
# If you have backend resources managed by Amplify (e.g., Genkit deployed via `amplify add function`),
# you might have a `backend` section here. For just hosting the Next.js app, this frontend config is key.
```

**Key points for Next.js on Amplify:**
*   Amplify Hosting has native support for Next.js features, including SSR, ISR, Image Optimization, and App Router.
*   Ensure your `next.config.js` does **not** have `output: 'export'` if you are using server-side features, which Adminity does.

### 4. Configure Environment Variables

Your application requires a `JWT_SECRET_KEY`. For Genkit AI features, you might also need `GOOGLE_API_KEY`. For the chat widget, you'll need `NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL`.

**Do NOT commit your actual secret keys to your repository.**

In the Amplify Console:
1.  Navigate to your app.
2.  Go to **App settings > Environment variables**.
3.  Click **Manage variables**.
4.  Add your environment variables. For a development environment, you can use specific dev keys:
    *   `JWT_SECRET_KEY`: *Your_Strong_Development_Secret_Key_For_Amplify*
    *   `GOOGLE_API_KEY`: *Your_Development_Google_AI_Studio_Key_For_Amplify* (if applicable)
    *   `NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL`: *Your_n8n_Chat_Webhook_URL_For_Development* (if applicable)
    *   You might also want to set other `NEXT_PUBLIC_` prefixed variables if your client-side code needs them.
    *   Amplify automatically sets `NODE_ENV` based on the branch (e.g., `development` for non-production branches).

These variables will be available during the build process and at runtime for your server-side code. Variables prefixed with `NEXT_PUBLIC_` will also be available client-side.

### 5. Deploy (Publish)

*   **If using Continuous Deployment (Git-based):**
    Commit and push your code (including `amplify.yml` if you created/modified it, and the `amplify` directory) to your connected Git branch. Amplify will automatically start a new build and deployment.

*   **If using Manual Deployment:**
    Run the following command from your project root:
    ```bash
    amplify publish
    ```
    This command will build your project (if needed) and upload the artifacts to Amplify Hosting.

### 6. Accessing Your Development App

Once the deployment is complete, the Amplify Console (and CLI output for `amplify publish`) will provide you with the URL for your development application (e.g., `https://dev.d12345abczyx.amplifyapp.com`).

## Genkit Considerations for Amplify

The Adminity `README.md` mentions running Genkit with `npm run genkit:dev`. If you intend to use Genkit AI features in your Amplify-hosted development environment:

*   **Separate Deployment**: Genkit flows usually run as a separate backend service. The `amplify.yml` provided above focuses on deploying the Next.js frontend.
*   **Hosting Genkit**:
    *   **Option 1 (AWS Lambda via Amplify)**: You could potentially adapt your Genkit flows to run as AWS Lambda functions, managed and deployed via Amplify (`amplify add function`). This keeps everything within the Amplify/AWS ecosystem. Your Next.js app would then call these Lambda functions.
    *   **Option 2 (Other Services)**: Deploy Genkit to another service (e.g., AWS Fargate, Amazon ECS, or even Google Cloud Run if you prefer multi-cloud, though this guide is Amplify-centric).
*   **CORS and Configuration**: Your Next.js frontend deployed on Amplify would then need to be configured to make API calls to your deployed Genkit service endpoint. This involves:
    *   Setting the correct API endpoint URL in your frontend code (likely via an environment variable like `NEXT_PUBLIC_GENKIT_API_URL` set in the Amplify Console).
    *   Ensuring CORS is correctly configured on the Genkit service to allow requests from your Amplify domain.

**For simpler local development testing with an Amplify-hosted frontend (more complex):**
If Genkit runs locally (`npm run genkit:dev`) and you want your Amplify-hosted frontend to call it:
1.  Your local Genkit server needs to be accessible from the internet (e.g., using a tool like ngrok).
2.  Configure your local Genkit to allow CORS from your Amplify dev URL.
3.  Set `NEXT_PUBLIC_GENKIT_API_URL` in Amplify Console to point to your ngrok URL.

This setup is generally more for temporary testing due to the complexities of exposing a local service.

## Troubleshooting

*   **Build Failures**: Check the build logs in the Amplify Console for detailed error messages. Ensure `npm ci` (or `npm install`) is part of your `preBuild` phase and that `npm run build` executes successfully.
*   **Environment Variables**: Double-check that all required environment variables are set correctly in the Amplify Console and are accessible by your application. Prefix with `NEXT_PUBLIC_` for client-side access.
*   **Next.js Version/Node.js Version**: Amplify supports recent LTS versions of Node.js. Ensure your project's Node.js version (specified in `package.json` engines, if any) is compatible. You can often specify a Node.js version in the Amplify Console under **Build settings > Build image settings**.
*   **Routing Issues (404s)**: Ensure your `artifacts.baseDirectory` in `amplify.yml` is correctly set to `.next`. Amplify's Next.js compute provider handles App Router and Pages Router routing. If you encounter issues with dynamic routes, check Amplify's documentation for any specific configurations related to Next.js rewrites or redirects if you have custom ones.

This guide should provide a solid foundation for deploying Adminity to AWS Amplify for your development needs.
