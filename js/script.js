let githubToken;
let githubUsername;

let followerNames = [];
let followingNames = [];
let currentPage = 1;
const itemsPerPage = 8;

let followersNotFollowing = [];
let followingNotFollowers = [];

$(document).ready(function () {
    $('#github-form').submit(function (event) {
        event.preventDefault();

        showLoading();
        $('#form').hide();

        githubToken = $('#github-token').val();
        githubUsername = $('#github-username').val();

        console.log("githubToken : " + githubToken + "  githubUsername : " + githubUsername);

        authenticateAndFetchData(githubUsername, githubToken);
    });

    // search new user
    $('#searchNew').click(function () {
        initialView();

        $('#github-username').val('');
        $('#github-username').focus();
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

// Hide the loading when the document is fully loaded
document.onreadystatechange = function () {
    if (document.readyState === "complete") {
        hideLoading();
        initialView();
    }
};

function initialView() {
    $('#form').show();
    $('#userDetails').hide();
    $('#img-divs').hide();
    $('#summary').hide();
    $('#followers-not-following-div').hide();
    $('#following-not-followers-div').hide();
    $('#loading-container').hide();
    $('#searchNew').hide();
}

function showLoading() {
    $('#loading-container').show();

    $('#userDetails').hide();
    $('#img-divs').hide();
    $('#summary').hide();
    $('#followers-not-following-div').hide();
    $('#following-not-followers-div').hide();
    $('#searchNew').hide();
}

function hideLoading() {
    $('#loading-container').hide();

    $('#userDetails').show();
    $('#img-divs').show();
    $('#summary').show();
    $('#followers-not-following-div').show();
    $('#following-not-followers-div').show();
    $('#searchNew').show();
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

                            followersNotFollowing = followerNames.filter(name => !followingNames.includes(name));
                            followingNotFollowers = followingNames.filter(name => !followerNames.includes(name));

                            checkEmpty();

                            displayFollowersNotFollowing();
                            displayFollowingNotFollowers();

                            displayFollowersDiv();
                            displayFollowingsDiv()
                        })
                        .catch(error => {
                            initialView();
                            console.log('Error fetching data: check username and token', error);
                            showError();
                        });
                })
                .catch(error => {
                    initialView();
                    console.log('Error fetching data: check username and token:', error);
                    showError();
                });
        })
        .catch(error => {
            initialView();
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

// check if empty arrays
function checkEmpty() {
    if (followerNames.length === 0) {
        $('#textNotFollowing').text("No Followers yet!");
    } else if (followersNotFollowing.length === 0) {
        $('#textNotFollowing').text("All followers are followed back by the user!");
    } else {
        $('#textNotFollowing').text("Here are the followers, but this user hasn't followed them.");
    }

    if (followerNames.length === 0) {
        $('#textNotFollowers').text("No followings yet!");
    } else if (followingNotFollowers.length === 0) {
        $('#textNotFollowers').text("The user is followed back by all followers!");
    } else {
        $('#textNotFollowers').text("Here are the followings, but they are not following this user.");
    }
}

// all followers
function displayFollowersDiv() {
    console.log("loading followers");
    const followersDiv = $('#followers-div');
    const paginationDiv = $('#pagination-followers-div');

    const followers = followerNames;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedFollowers = followers.slice(startIndex, endIndex);

    $('#allFollowersCount').text(followerNames.length);

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

    followersDiv.html(profilesList.join(''));

    // Pagination Followers
    const totalPages = Math.ceil(followers.length / itemsPerPage);
    const paginationButtons = Array.from({ length: totalPages }, (_, i) => i + 1);

    const paginationHtml = paginationButtons.map(page => {
        const activeClass = page === currentPage ? 'active' : '';
        return `<button class="m-1 btn btn-sm btn-outline-success ${activeClass}
        " onclick="changePageFollowers(${page})">${page}</button>`;
    }).join('');

    paginationDiv.html(paginationHtml);
}

function changePageFollowers(page) {
    currentPage = page;
    displayFollowersDiv();
}

// all followings
function displayFollowingsDiv() {
    console.log("loading followings");
    const followingsDiv = $('#followings-div');
    const paginationDiv = $('#pagination-followings-div');

    const followings = followingNames;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedFollowings = followings.slice(startIndex, endIndex);

    $('#allFollowingsCount').text(followingNames.length);

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

    followingsDiv.html(profilesList.join(''));

    // Pagination Followings
    const totalPages = Math.ceil(followings.length / itemsPerPage);
    const paginationButtons = Array.from({ length: totalPages }, (_, i) => i + 1);

    const paginationHtml = paginationButtons.map(page => {
        const activeClass = page === currentPage ? 'active' : '';
        return `<button class="m-1 btn btn-sm btn-outline-success ${activeClass}
        " onclick="changePageFollowings(${page})">${page}</button>`;
    }).join('');

    paginationDiv.html(paginationHtml);
}

function changePageFollowings(page) {
    currentPage = page;
    displayFollowingsDiv();
}

// followers Not Following
function displayFollowersNotFollowing() {
    const followersNotFollowingDiv = $('#followers-but-not-Following');
    const paginationDiv = $('#pagination-followers-but-not-Following');



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

// following Not Followers
function displayFollowingNotFollowers() {
    const followingNotFollowersDiv = $('#Following-but-not-followers');
    const paginationDiv = $('#pagination-Following-but-not-followers');

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