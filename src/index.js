(async function getFollowingAndFollowers() {
  const HASH_FOLLOWERS = "c76146de99bb02f6415203be841dd25a";
  const HASH_FOLLOWINGS = "d04b0a864b4b54837c0d870b0e77e076";

  const username = location.pathname.split("/")[1];
  const igUrl = `https://www.instagram.com/${username}/?__a=1`;
  const user = await fetch(igUrl).then((r) => r.json());
  console.log(user);
  const id = user.graphql.user.id;

  for (const mode of ["following", "followers"]) {
    let nodes = [];
    let after = undefined;
    do {
      let params = {
        query_hash: mode == "followers" ? HASH_FOLLOWERS : HASH_FOLLOWINGS,
        variables: JSON.stringify({ id, first: 50, after }),
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
    console.table(users);

    let x = window.open();
    x.document.open();
    x.document.write(
      `<html>
        <title>${mode}</title>
        <body>
          <pre>
          ${JSON.stringify(users, null, 2)}
          </pre>
        </body>
      </html>`
    );
    x.document.close();
  }
})();
