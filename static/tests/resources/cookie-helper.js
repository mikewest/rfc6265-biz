// A tiny helper which returns the result of fetching |url| with credentials.
function credFetch(url) {
  return fetch(url, {"credentials": "include"});
}

// Asserts that `document.cookie` contains or does not contain (according to
// the value of |present|) a cookie named |name| with a value of |value|.
function assert_dom_cookie(name, value, present) {
  var re = new RegExp("(?:^|; )" + name + "=" + value + "(?:$|;)");
  assert_equals(re.test(document.cookie), present, "`" + name + "=" + value + "` in `document.cookie`");
}

// Asserts that a request to |origin| contains or does not contain (according
// to the value of |present|) a cookie named |name| with a value of |value|.
function assert_http_cookie(origin, name, value, present) {
  return credFetch(origin + "/cookie/list")
      .then(r => r.json())
      .then(j => {
        assert_equals(j[name], present ? value : undefined, "`" + name + "=" + value + "` in request to `" + origin + "`.");
      });
}

// Remove the cookie named |name| from |origin|, then set it on |origin| anew.
// If |origin| matches `document.origin`, also assert that the cookie was
// correctly removed and reset.
function create_cookie(origin, name, value, extras) {
  return credFetch(origin + "/cookie/drop?name=" + name)
    .then(_ => {
      if (origin == document.origin)
        assert_dom_cookie(name, value, false);
    })
    .then(_ => {
      return credFetch(origin + "/cookie/set?" + name + "=" + value + ";path=/;" + extras)
        .then(_ => {
          if (origin == document.origin)
            assert_dom_cookie(name, value, true);
        });
    });
}