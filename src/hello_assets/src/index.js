import { hello } from "../../declarations/hello";

const padding = (s, len, isZero) => {
  if (isZero) {
    return s;
  } else {
    len = len - (s + '').length;
    for (let i = 0; i < len; i++) {
      s = '0' + s;
    }
    return s;
  }
}

const formatData = (date, pattern, isZero) => {
  let newDate;
  switch (typeof (date)) {
    case 'string':
      newDate = new Date(date);
      break; //字符串格式
    case 'number':
      newDate = new Date();
      newDate.setTime(date * 1000);
      break; //时间戳格式
    case 'object':
      newDate = date;
      break;
    default:
      return date;
  }
  if (!newDate) {
    return '-';
  } else {
    pattern = pattern || 'yyyy-MM-dd';
    return pattern.replace(/([yMdhsmw])(\1*)/g, function ($0) {
      switch ($0.charAt(0)) {
        case 'y':
          return padding(newDate.getFullYear(), $0.length, isZero);
        case 'M':
          return padding(newDate.getMonth() + 1, $0.length, isZero);
        case 'd':
          return padding(newDate.getDate(), $0.length, isZero);
        case 'w':
          return newDate.getDay();
        case 'h':
          return padding(newDate.getHours(), $0.length, isZero);
        case 'm':
          return padding(newDate.getMinutes(), $0.length, isZero);
        case 's':
          return padding(newDate.getSeconds(), $0.length, isZero);
      }
    });
  }
}

async function post() {
  const error = document.getElementById("error");
  error.innerText = "";
  const textarea = document.getElementById("message");
  const otp = document.getElementById("otp").value;
  const text = textarea.value;
  try {
    await hello.post(otp, text);
    textarea.value = "";
    // load_posts()
  } catch (err) {
    console.log(err);
    error.innerText = "发布失败";
  }
}

// let num_posts = 0;
const getPostsList = async () => {
  return await hello.timeline(new Date().getTime());
}

const renderPostsList = _posts => {
  const posts_section = document.querySelector("#posts");
  const fragement = document.createDocumentFragment();
  posts_section.replaceChildren([]);
  _posts.forEach(item => {
    const post = document.createElement("p");
    const time = formatData(parseInt(item.sinced.toString().substring(0, 10)));
    post.innerText = `${item.content}---${time}---${item.author}`;
    fragement.appendChild(post);
  })
  posts_section.appendChild(fragement);
}

// async function load_posts() {
//   const posts_section = document.getElementById("posts");
//   let posts = await hello.posts(new Date().getTime());

//   if (num_posts == posts.length) return;
//   posts_section.replaceChildren([]);

//   const fragement = document.createDocumentFragment();

//   for (let i = 0; i < posts.length; i++) {
//     const post = document.createElement("p");
//     post.innerText = `${posts[i].content}---${posts[i].sinced}---${posts[i].author}`;
//     fragement.appendChild(post);
//   }
//   posts_section.appendChild(fragement);
// }

const getFollowList = async () => {
  try {
    const res = await hello.follows();
    const fragement = document.createDocumentFragment();
    res.forEach(principal => {
      const follower = document.createElement("p");
      follower.innerText = principal.toString();
      follower.setAttribute('principal', principal.toString())
      fragement.appendChild(follower);
    })
    document.querySelector(".follow-list").appendChild(fragement)
  } catch (error) {
    console.log(error);
  }
}

function load() {
  // const post_button = document.getElementById("message");
  // post_button.onclick = post;
  // load_posts();
  // setInterval(load_posts, 3000);
  let postsList;
  getPostsList().then(res => {
    postsList = res;
    renderPostsList(res)
  }).catch(err => {
    console.log(err);
  })

  getFollowList();

  document.querySelector("#post").addEventListener('click', function (e) {
    post();
  })

  document.querySelector(".follow-list").addEventListener('click', function (e) {
    const _this = e.target;
    postsList && postsList.filter(item => item.author === _this.getAttribute('principal')).forEach(item => renderPostsList([item]))
  })

  document.querySelector(".reset-btn").addEventListener('click', function (e) {
    postsList && renderPostsList(postsList)
  })
}

window.onload = load