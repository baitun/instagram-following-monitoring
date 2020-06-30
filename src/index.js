(async function getFollowingAndFollowers() {
  const HASH_FOLLOWERS = 'c76146de99bb02f6415203be841dd25a';
  const HASH_FOLLOWINGS = 'd04b0a864b4b54837c0d870b0e77e076';

  let username = location.pathname.split('/')[1];
  let user = await fetch(`https://www.instagram.com/${username}/?__a=1`).then(r => r.json());
  console.log(user);
  let id = user.graphql.user.id;
  let url = new URL('https://www.instagram.com/graphql/query/');

  for (let mode of ['following', 'followers']) {
    let nodes = [];
    let after = undefined;
    do {
      let params = {
        query_hash: mode == 'followers' ? HASH_FOLLOWERS : HASH_FOLLOWINGS,
        variables: JSON.stringify({ id, first: 50, after })
      };
      url.search = new URLSearchParams(params).toString();
      let d = await fetch(url).then(r => r.json());
      const edge = mode == 'followers' ? d.data.user.edge_followed_by : d.data.user.edge_follow;
      nodes.push(...edge.edges);
      after = edge.page_info.end_cursor;
    } while (after);

    let users = nodes.map(i => i.node).map(({ profile_pic_url, ...rest }) => rest);
    console.table(users);

    let x = window.open();
    x.document.open();
    x.document.write(`<html><title>${mode}</title><body><pre>${JSON.stringify(users, null, 2)}</pre></body></html>`);
    x.document.close();
  }
})();