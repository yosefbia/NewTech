
//Task 1: Fetch User Profile

function fetchGitHubUser(username) {
  return fetch(`https://api.github.com/users/${username}`)
    .then(function (response) {
      if (response.status === 404) {
        return Promise.reject("User not found");
      }

      if (response.status === 403) {
        return Promise.reject("GitHub API rate limit exceeded or request forbidden");
      }

      if (!response.ok) {
        return Promise.reject("Failed to fetch user");
      }

      return response.json();
    });
}

function fetchRepos(user) {
  return fetch(`https://api.github.com/users/${user.login}/repos`)
    .then(function (response) {
      if (!response.ok) {
        return Promise.reject("Failed to fetch repos");
      }

      return response.json();
    });
}

function fetchRepoLanguages(repo) {
  return fetch(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/languages`)
    .then(function (response) {
      if (!response.ok) {
        return Promise.reject("Failed to fetch languages");
      }

      return response.json();
    })
    .catch(function () {
      console.log(`Failed to fetch languages for ${repo.name}`);
      return {};
    });
}

fetchGitHubUser("octocat")
  .then(function (user) {
    return fetchRepos(user);
  })
  .then(function (repos) {
    var firstFiveRepos = repos.slice(0, 5);

    var languagePromises = firstFiveRepos.map(function (repo) {
      return fetchRepoLanguages(repo).then(function (languages) {
        return {
          name: repo.name,
          languages: languages
        };
      });
    });

    return Promise.all(languagePromises);
  })
  .then(function (result) {
    console.log(result);
  })
  .catch(function (error) {
    console.log(error);
  })
  .finally(function () {
    console.log("GitHub Explorer operation complete");
  });