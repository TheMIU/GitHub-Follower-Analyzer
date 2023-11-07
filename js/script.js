const { Octokit } = require('@octokit/core');

// Github token
const githubToken = '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';

const octokit = new Octokit({
    auth: `token ${githubToken}`,
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

async function fetchAllFollowings(username) {
    try {
        let allFollowings = [];
        let page = 1;
        let response;

        do {
            response = await octokit.request('GET /users/{username}/following', {
                username,
                page,
                per_page: 100, // Adjust the per_page value as needed
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28',
                },
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

// GitHub username
const username = 'themiu';

Promise.all([fetchAllFollowers(username), fetchAllFollowings(username)])
    .then(([followers, followings]) => {
        const followerNames = followers.map(follower => follower.login);
        const followingNames = followings.map(following => following.login);

        // Followers but not Following
        const followersNotFollowing = followerNames.filter(name => !followingNames.includes(name));

        // Following but not Followers
        const followingNotFollowers = followingNames.filter(name => !followerNames.includes(name));

        //console.log('Followers:', followerNames);
        //console.log('Following:', followingNames);
        console.log('Followers:', followerNames.length);
        console.log('Following:', followingNames.length);
        console.log('Followers but not Following:', followersNotFollowing);
        console.log('Following but not Followers:', followingNotFollowers);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
