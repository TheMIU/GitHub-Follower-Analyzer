const githubToken = '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';
const githubUsername = 'themiu';

// Authenticate using the token
fetch('https://api.github.com/user', {
  headers: {
    'Authorization': `token ${githubToken}`
  }
})
.then(response => response.json())
.then(user => {
    console.log('Token:', githubToken);

    // Now you can use the token and make AJAX requests with it
    fetchAllFollowers(githubUsername)
        .then(followers => {
            fetchAllFollowings(githubUsername)
                .then(followings => {
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
                .catch(error => {
                    console.error('Error:', error);
                });
        })
        .catch(error => {
            console.error('Error:', error);
        });
})
.catch(error => {
    console.error('Authentication failed:', error);
});

function fetchAllFollowers(username) {
    return fetchPaginatedData(`https://api.github.com/users/${username}/followers`);
}

function fetchAllFollowings(username) {
    return fetchPaginatedData(`https://api.github.com/users/${username}/following`);
}

async function fetchPaginatedData(url) {
    let allData = [];
    let page = 1;
    let response;

    do {
        response = await fetch(url + `?page=${page}&per_page=100`, {
            headers: {
                'Authorization': `token ${githubToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        allData = allData.concat(data);

        const linkHeader = response.headers.get('Link');
        const nextLink = extractNextLink(linkHeader);

        if (nextLink) {
            url = nextLink;
        } else {
            break;
        }

        page++;
    } while (true);

    return allData;
}

function extractNextLink(linkHeader) {
    if (!linkHeader) {
        return null;
    }

    const links = linkHeader.split(',');
    for (const link of links) {
        const [url, rel] = link.split(';');
        if (rel.includes('rel="next"')) {
            return url.trim().slice(1, -1);
        }
    }

    return null;
}
