async function getFollowingOrFollowers(mode, userId) {
  const HASH_FOLLOWERS = "c76146de99bb02f6415203be841dd25a";
  const HASH_FOLLOWINGS = "d04b0a864b4b54837c0d870b0e77e076";

  let nodes = [];
  let after = undefined;
  do {
    let params = {
      query_hash: mode == "followers" ? HASH_FOLLOWERS : HASH_FOLLOWINGS,
      variables: JSON.stringify({ id: userId, first: 50, after }),
    };
    let queryUrl = new URL("https://www.instagram.com/graphql/query/");
    queryUrl.search = new URLSearchParams(params).toString();
    let d = await fetch(queryUrl).then((r) => r.json());
    const edge =
      mode == "followers"
        ? d.data.user.edge_followed_by
        : d.data.user.edge_follow;
    nodes.push(...edge.edges);
    after = edge.page_info.end_cursor;
  } while (after);

  let users = nodes
    .map((i) => i.node)
    // profile_pic_url is too long, always changes and we don't need it, so let's remove it
    // eslint-disable-next-line no-unused-vars
    .map(({ profile_pic_url, ...rest }) => rest);
  console.log(mode);
  console.table(users);

  return users;
}

function combine({ following, followers }) {
  const mutual = followers
    .filter((user1) => {
      return following.find((user2) => user2.id === user1.id);
    })
    .map((user) => ({ ...user, type: "mutual" }));

  const uniqueFollowers = followers
    .filter((user1) => {
      return !mutual.find((user2) => user2.id === user1.id);
    })
    .map((user) => ({ ...user, type: "followers" }));

  const uniqueFollowing = following
    .filter((user1) => {
      return !mutual.find((user2) => user2.id === user1.id);
    })
    .map((user) => ({ ...user, type: "following" }));

  let allUsers = [...mutual, ...uniqueFollowers, ...uniqueFollowing];

  allUsers = allUsers.sort((a, b) => a.id - b.id);

  return allUsers;
}

(async function getFollowingAndFollowers() {
  const username = location.pathname.split("/")[1];
  const igUrl = `https://www.instagram.com/${username}/?__a=1`;
  const user = await fetch(igUrl).then((r) => r.json());
  console.log(user);
  const userId = user.graphql.user.id;

  const getFollowing = async () =>
    await getFollowingOrFollowers("following", userId);
  const getFollowers = async () =>
    await getFollowingOrFollowers("followers", userId);

  const following = await getFollowing();
  const followers = await getFollowers();

  const users = combine({ following, followers });

  let x = window.open();
  x.document.open();
  const json = JSON.stringify(users, null, 2);
  x.document.write(
    `<html><title>${username}</title><body><pre>${json}</pre></body></html>`
  );
  x.document.close();
})();
