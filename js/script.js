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

async function fetchAllFollowings(username) {
    try {
        let allFollowings = [];
        let page = 1;
        let response;

        do {
            response = await octokit.request('GET /users/{username}/following', { // Updated to 'following'
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


/////////////////////////////////////////////////////////

//GitHub username
const username = 'themiu';

fetchAllFollowers(username)
    .then((followers) => {
        const followerNames = followers.map(follower => follower.login);
        console.log('Followers:', followerNames.length);
        //console.log('Follower Names:', followerNames);
    })
    .catch((error) => {
        console.error('Error:', error);
    });

fetchAllFollowings(username)
    .then((followings) => {``
        const followingNames = followings.map(following => following.login);
        console.log('followings:', followingNames.length);
        //console.log('following Names:', followingNames);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
