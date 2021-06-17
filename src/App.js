import { useEffect, useState } from "react";
import "./styles.css";

function runner(generator) {
  let done = false;
  let aborted = false;
  let gen = generator();

  function step(...params) {
    if (done) throw new Error("gen already done! cannot step further");
    let next = gen.next(...params);

    if (next.done) done = true;
    let promise = Promise.resolve(next.value);

    promise
      .then((...args) => {
        if (!done && !aborted) {
          step(...args);
        }
      })
      .catch((e) => {
        if (!aborted) {
          throw e;
        }
      });
  }

  step();

  return function () {
    console.log("did abort");
    aborted = true;
  };
}

function useGeneratorEffect(create, deps) {
  useEffect(() => {
    const abort = runner(create());

    return abort;
  }, deps);
}

function* generatorDemo(id, callback) {
  let user = yield fetch(
    `https://jsonplaceholder.typicode.com/users/${id}`
  ).then((res) => res.json());
  yield new Promise((res) => setTimeout(res, 1000));

  let [posts, albums] = yield Promise.all([
    fetch(
      `https://jsonplaceholder.typicode.com/users/${id}/posts`
    ).then((res) => res.json()),
    fetch(
      `https://jsonplaceholder.typicode.com/users/${id}/albums`
    ).then((res) => res.json())
  ]);

  callback({ user, posts, albums });
}

function Demo({ id }) {
  useGeneratorEffect(() => {
    return () => generatorDemo(id, (res) => console.log(res));
  }, [id]);

  return null;
}
export default function App() {
  const [id, setId] = useState(1);
  useEffect(() => {
    setTimeout(() => {
      console.log("upgrading ID");
      setId((old) => old + 1);
    }, 500);
  }, []);
  console.log("id", id);
  return (
    <div className="App">
      <Demo id={id} />
      <h1>Hello CodeSandbox</h1>
      <h2>Edit to see some magic happen!</h2>
    </div>
  );
}
