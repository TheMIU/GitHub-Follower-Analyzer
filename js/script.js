const githubURL = `https://github.com/themiu?tab=followers`;

try {
    // Fetch the GitHub page
    const response = await fetch(githubURL);
    const html = await response.text();

    // Create a temporary div to parse the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Extract follower names
    const followerElements = tempDiv.querySelectorAll('.d-table-cell.col-9.v-align-top.pr-3 .Link--secondary');
    const followerNames = Array.from(followerElements).map(element => element.textContent.trim());

    // Display follower names
    followerList.innerHTML = '';
    followerNames.forEach(name => {
        console.log(name);
    });

} catch (error) {
    alert('An error occurred while fetching or parsing the data.');
}