const axios = require('axios');
const querystring = require('querystring');
const dotenv = require('dotenv').config();

// console.log(dotenv.parsed.Webhook);

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify('Invalid payload'),
        };
    }

    // Parse the incoming GitHub webhook payload
    const githubData = JSON.parse(event.body);

    let messageText = '';

    // Check if the event is a new issue being opened
    if (githubData.action === 'opened' && githubData.issue) {
        const issueTitle = githubData.issue.title;
        const issueUrl = githubData.issue.html_url;
        messageText = `New issue opened: ${issueTitle}\nSee the issue here: ${issueUrl}`;
    } 
    // Check if the event is a push
    else if (githubData.pusher && githubData.commits) {
        const pusherName = githubData.pusher.name;
        const commitMessage = githubData.commits[0].message; // Assuming you want the first commit message
        messageText = `Push by ${pusherName}: ${commitMessage}`;
    }
    // Check if the event is a pull request
    else if (githubData.action && githubData.pull_request) {
        const prTitle = githubData.pull_request.title;
        const prUrl = githubData.pull_request.html_url;
        messageText = `Pull Request ${githubData.action}: ${prTitle}\nSee the PR here: ${prUrl}`;
    } 
    else {
        // Capture more details for other types of events
        messageText = `Event Type: ${githubData.zen}\nRepository: ${githubData.repository.full_name}\nEvent Details: ${JSON.stringify(githubData, null, 2)}`;
    }

    // Format the message for Synology Chat
    const synologyMessage = {
        text: messageText
    };

    // Convert the message to the expected format
    const postData = querystring.stringify({
        payload: JSON.stringify(synologyMessage)
    });

    // Send the message to Synology Chat
    await axios.post(dotenv.parsed.Webhook, postData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    // Respond to the webhook sender (GitHub in this case)
    return {
        statusCode: 200,
        body: JSON.stringify('Webhook processed successfully!'),
    };
};
