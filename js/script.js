let githubToken;
let githubUsername;

$(document).ready(function () {
    $('#github-form').submit(function (event) {
        event.preventDefault();

        showLoading();

        githubToken = $('#github-token').val();
        githubUsername = $('#github-username').val();

        console.log("githubToken : " + githubToken + "  githubUsername : " + githubUsername);

        authenticateAndFetchData(githubUsername, githubToken);
    });
});

////////// loading //////////
hideLoading();

$('#count').hide();
$('#img-divs').hide();

function showLoading() {
    $('#count').hide();
    $('#img-divs').hide();

    $('#loading-container').addClass('d-flex');
    $('#loading-container').show();
}

function hideLoading() {
    $('#loading-container').hide();
    $('#loading-container').removeClass('d-flex');
    $('#count').show();
    $('#img-divs').show();
}


////////// fetch followers data //////////
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
                            hideLoading();

                            displayFollowers(followers);
                            displayFollowing(followings);

                            const followerNames = followers.map(follower => follower.login);
                            const followingNames = followings.map(following => following.login);

                            // Followers but not Following
                            const followersNotFollowing = followerNames.filter(name => !followingNames.includes(name));

                            // Following but not Followers
                            const followingNotFollowers = followingNames.filter(name => !followerNames.includes(name));

                            displayFollowersNotFollowing(followerNames, followingNames);
                            displayFollowingNotFollowers(followerNames, followingNames);
                        })
                        .catch(error => {
                            hideLoading();
                            console.log('Error fetching data: check username and token', error);
                            alert('Error fetching data: check username and token');
                        });
                })
                .catch(error => {
                    hideLoading();
                    console.log('Error fetching data: check username and token:', error);
                    alert('Error fetching data: check username and token');
                });
        })
        .catch(error => {
            hideLoading();
            console.log('Authentication failed:', error);
            alert('Authentication failed');
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


////////// display data //////////
function displayFollowers(followers) {
    console.log(followers);
    const followersDiv = $('#followers');
    followersDiv.empty();

    const followerCount = followers.length;
    followersDiv.html(`<p>${followerCount}</p>`);
}

function displayFollowing(followings) {
    console.log(followings);
    const followingDiv = $('#following');
    followingDiv.empty();

    const followingCount = followings.length;
    followingDiv.html(`<p>${followingCount}</p>`);
}

function displayFollowersNotFollowing(followerNames, followingNames) {
    const followersNotFollowingDiv = $('#followers-but-not-Following');
    followersNotFollowingDiv.empty();

    const followersNotFollowing = followerNames.filter(name => !followingNames.includes(name));

    // Create a list of profile picture and name elements
    const profilesList = followersNotFollowing.map(name => {

        const avatarUrl = `https://github.com/${name}.png`;
        const githubProfileUrl = `https://github.com/${name}`;

        return `
        <a href="${githubProfileUrl}" target="_blank">
        <div class="userDataDiv">
                <img src="${avatarUrl}" alt="${name}'s Avatar" width="50" height="50">
                <p>${name}</p>
        </div>
        </a>`;
    });

    followersNotFollowingDiv.html(profilesList.join(''));
}

function displayFollowingNotFollowers(followerNames, followingNames) {
    const followingNotFollowersDiv = $('#Following-but-not-followers');
    followingNotFollowersDiv.empty();

    const followingNotFollowers = followingNames.filter(name => !followerNames.includes(name));

    // Create a list of profile picture and name elements
    const profilesList = followingNotFollowers.map(name => {

        const avatarUrl = `https://github.com/${name}.png`;
        const githubProfileUrl = `https://github.com/${name}`;

        return `
        <a href="${githubProfileUrl}" target="_blank">
        <div class="userDataDiv">
                <img src="${avatarUrl}" alt="${name}'s Avatar" width="50" height="50">
                <p>${name}</p>
        </div>
        </a>`;
    });

    followingNotFollowersDiv.html(profilesList.join(''));
}

