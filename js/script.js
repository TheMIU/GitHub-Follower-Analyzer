let githubToken;
let githubUsername;

let followerNames = [];
let followingNames = [];
let currentPage = 1;
const itemsPerPage = 8;

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

////////// Error //////////
function showError() {
    Swal.fire({
        title: 'Error fetching data!',
        text: 'check username and token',
        icon: 'error',
        confirmButtonText: 'ok',
        buttonsStyling: false,
        customClass: {
            confirmButton: 'btn btn-outline-success'
        }
    });
}
    
////////// loading //////////
hideLoading();

$('#count').hide();
$('#img-divs').hide();

function showLoading() {
    $('#count').hide();
    $('#img-divs').hide();
    $('#loading-container').show();
}

function hideLoading() {
    $('#loading-container').hide();
    $('#count').show();
    $('#img-divs').show();
}

//$('#loading-container').hide();

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

                            followerNames = followers.map(follower => follower.login);
                            followingNames = followings.map(following => following.login);

                            displayFollowersNotFollowing(followerNames, followingNames);
                            displayFollowingNotFollowers(followerNames, followingNames);
                        })
                        .catch(error => {
                            hideLoading();
                            console.log('Error fetching data: check username and token', error);
                            showError();
                        });
                })
                .catch(error => {
                    hideLoading();
                    console.log('Error fetching data: check username and token:', error);
                    showError();
                });
        })
        .catch(error => {
            hideLoading();
            console.log('Authentication failed:', error);
            showError();
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
    $('#followers').text(followers.length);
}

function displayFollowing(followings) {
    console.log(followings);
    $('#following').text(followings.length);
}

function displayFollowersNotFollowing() {
    const followersNotFollowingDiv = $('#followers-but-not-Following');
    const paginationDiv = $('#pagination-followers-but-not-Following');

    const followersNotFollowing = followerNames.filter(name => !followingNames.includes(name));

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedFollowers = followersNotFollowing.slice(startIndex, endIndex);

    $('#followers-not-following-count').text(followersNotFollowing.length);

    // Create a list of profile picture and name elements
    const profilesList = displayedFollowers.map(name => {
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

    // Pagination FollowersNotFollowing
    const totalPages = Math.ceil(followersNotFollowing.length / itemsPerPage);
    const paginationButtons = Array.from({ length: totalPages }, (_, i) => i + 1);

    const paginationHtml = paginationButtons.map(page => {
        const activeClass = page === currentPage ? 'active' : '';
        return `<button class="m-1 btn btn-sm btn-outline-success ${activeClass}
        " onclick="changePageFollowersNotFollowing(${page})">${page}</button>`;
    }).join('');

    paginationDiv.html(paginationHtml);
}

function changePageFollowersNotFollowing(page) {
    currentPage = page;
    displayFollowersNotFollowing();
}


function displayFollowingNotFollowers() {
    const followingNotFollowersDiv = $('#Following-but-not-followers');
    const paginationDiv = $('#pagination-Following-but-not-followers');

    const followingNotFollowers = followingNames.filter(name => !followerNames.includes(name));

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedFollowings = followingNotFollowers.slice(startIndex, endIndex);


    $('#following-not-followers-count').text(followingNotFollowers.length);

    // Create a list of profile picture and name elements
    const profilesList = displayedFollowings.map(name => {

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

    // Pagination FollowersNotFollowing
    const totalPages = Math.ceil(followingNotFollowers.length / itemsPerPage);
    const paginationButtons = Array.from({ length: totalPages }, (_, i) => i + 1);

    const paginationHtml = paginationButtons.map(page => {
        const activeClass = page === currentPage ? 'active' : '';
        return `<button class="m-1 btn btn-sm btn-outline-success ${activeClass}
        " onclick="changePageFollowingNotFollowers(${page})">${page}</button>`;
    }).join('');

    paginationDiv.html(paginationHtml);
}

function changePageFollowingNotFollowers(page) {
    currentPage = page;
    displayFollowingNotFollowers()
}