let githubToken;
let githubUsername;

$(document).ready(function () {
    $('#github-form').submit(function (event) {
        event.preventDefault(); // Prevent the default form submission

        githubToken = $('#github-token').val();
        githubUsername = $('#github-username').val();

        console.log("githubToken : " + githubToken + "  githubUsername : " + githubUsername);

        authenticateAndFetchData(githubUsername, githubToken);
    });
});

function authenticateAndFetchData(username, token) {
    // Authenticate using the provided token
    fetch('https://api.github.com/user', {
        headers: {
            'Authorization': `token ${token}`
        }
    })
        .then(response => response.json())
        .then(user => {
            // token and make AJAX requests with it
            fetchAllFollowers(username, token)
                .then(followers => {
                    fetchAllFollowings(username, token)
                        .then(followings => {
                            console.log('Followers:', followers.length);
                            console.log('Following:', followings.length);
                            displayFollowers(followers);
                            displayFollowing(followings);

                            const followerNames = followers.map(follower => follower.login);
                            const followingNames = followings.map(following => following.login);

                            // Followers but not Following
                            const followersNotFollowing = followerNames.filter(name => !followingNames.includes(name));

                            // Following but not Followers
                            const followingNotFollowers = followingNames.filter(name => !followerNames.includes(name));

                            console.log('Followers but not Following:', followersNotFollowing);
                            console.log('Following but not Followers:', followingNotFollowers);
                            displayFollowersNotFollowing(followerNames, followingNames);
                            displayFollowingNotFollowers(followerNames, followingNames);
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
}

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


//////////////// display data
function displayFollowers(followers) {
    const followersDiv = $('#followers');
    followersDiv.empty();

    const followerCount = followers.length;
    followersDiv.html(`<p>Followers: ${followerCount}</p>`);
}

function displayFollowing(followings) {
    const followingDiv = $('#following');
    followingDiv.empty();

    const followingCount = followings.length;
    followingDiv.html(`<p>Following: ${followingCount}</p>`);
}

function displayFollowersNotFollowing(followerNames, followingNames) {
    const followersNotFollowingDiv = $('#followers-but-not-Following');
    followersNotFollowingDiv.empty();

    const followersNotFollowing = followerNames.filter(name => !followingNames.includes(name));
    followersNotFollowingDiv.html(`<p>Followers but not Following: ${followersNotFollowing.join(', ')}</p>`);
}

function displayFollowingNotFollowers(followerNames, followingNames) {
    const followingNotFollowersDiv = $('#Following-but-not-followers');
    followingNotFollowersDiv.empty();

    const followingNotFollowers = followingNames.filter(name => !followerNames.includes(name));
    followingNotFollowersDiv.html(`<p>Following but not Followers: ${followingNotFollowers.join(', ')}</p>`);
}