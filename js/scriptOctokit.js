
//////////////////////////////
//      using Octokit       //
//////////////////////////////

const { createTokenAuth } = require('@octokit/auth-token');
const { Octokit } = require('@octokit/core');

const githubToken = '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';
const githubUsername = 'themiu';

// Create a token authentication instance
const auth = createTokenAuth(githubToken);

// Authenticate using the token
auth()
    .then((authResponse) => {
        const token = authResponse.token;
        const octokit = new Octokit({ auth: `token ${token}` });

        // Now you can use the token and octokit for authentication
        console.log('Token:', token);

        // You can call your fetch functions here with the retrieved values
        fetchAllFollowers(githubUsername, octokit)
            .then((followers) => {
                
                fetchAllFollowings(githubUsername, octokit)
                .then((followings) => {
                        console.log('Followers:', followers.length);
                        console.log('Following:', followings.length);

                        const followerNames = followers.map(follower => follower.login);
                        const followingNames = followings.map(following => following.login);

                        // Followers but not Following
                        const followersNotFollowing = followerNames.filter(name => !followingNames.includes(name));

                        // Following but not Followers
                        const followingNotFollowers = followingNames.filter(name => !followerNames.includes(name));

                        console.log('Followers but not Following:', followersNotFollowing);
                        console.log('Following but not Followers:', followingNotFollowers);
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    })
    .catch((error) => {
        console.error('Authentication failed:', error);
    });

async function fetchAllFollowers(username, octokit) {
    try {
        let allFollowers = [];
        let page = 1;
        let response;

        do {
            response = await octokit.request('GET /users/{username}/followers', {
                username,
                page,
                per_page: 100, // Adjust the per_page value as needed
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

async function fetchAllFollowings(username, octokit) {
    try {
        let allFollowings = [];
        let page = 1;
        let response;

        do {
            response = await octokit.request('GET /users/{username}/following', {
                username,
                page,
                per_page: 100, // Adjust the per_page value as needed
            });

            allFollowings = allFollowings.concat(response.data);

            page++;
        } while (response.headers.link && response.headers.link.includes('rel="next"'));

        return allFollowings;
    } catch (error) {
        console.error('Error:', error.message);
        return [];
    }
}
