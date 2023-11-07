/* const { Octokit } = require('@octokit/core');

const octokit = new Octokit({
    auth: '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', //  actual GitHub token
});

async function fetchFollowers(username) {
    try {
        const response = await octokit.request('GET /users/{username}/followers', {
            username,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28',
            },
        });

        const followers = response.data;
        return followers;
    } catch (error) {
        console.error('Error:', error.message);
        return [];
    }
}

// Replace 'github-username'
const username = 'themiu';

fetchFollowers(username)
    .then((followers) => {
        const followerNames = followers.map(follower => follower.login);
        console.log('Follower Names:', followerNames);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
 */

//////////////////////////////////
const { Octokit } = require('@octokit/core');

const octokit = new Octokit({
    auth: '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', // actual GitHub token
});

async function fetchAllFollowers(username) {
    try {
        let allFollowers = [];
        let page = 1;
        let response;

        do {
            response = await octokit.request('GET /users/{username}/followers', {
                username,
                page,
                per_page: 100, // Adjust the per_page value as needed
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28',
                },
            });

            allFollowers = allFollowers.concat(response.data);

            page++;
        } while (response.headers.link && response.headers.link.includes('rel="next"'));

        return allFollowers;

    } catch (error) {
        console.error('Error:', error.message);
        return [];
    }
}

//GitHub username
const username = 'themiu';

fetchAllFollowers(username)
    .then((followers) => {
        const followerNames = followers.map(follower => follower.login);
        console.log('Followers:', followerNames.length);
        console.log('Follower Names:', followerNames);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
