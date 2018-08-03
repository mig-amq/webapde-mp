
 var limit = 5;
 var skip = 0;

 let loader = $("#post-loader");
 
 const _TYPES = {
   def: 'default',
   search: 'search',
   tag: 'tag',
 }

 async function getData(type = _TYPES.def, query = {}, limit = 5, skip = 0) {
   let p = new Promise ((res, rej) => {
     $.ajax({
       url: '/post/' + type + '/',
       data: {
         query: query,
         limig: limit,
         skip: skip,
       },
       success: (data) => {
         res(data);
       },
       error: (err) => {
         rej(err);
       }
     })
   })

   return await p;
 }


 function putContent(type = _TYPES.def, query = {}, limit = 5, skip = 0) {
   loader.addClass('active');

   getData(type,query, limit, skip).then((d) => {
     d.forEach(e => {
       $("#content #cards").append(parsePost(e));
     });

     $('.image').dimmer({
       on: 'hover'
     });

     $('.image').blur((e) => $('.image').dimmer('hide'));

     loader.removeClass('active');
   });
 }

 // @TODO
 function update_status (pid, elem) {
   alert(pid);
 }

 /**
  * The following functions are used to parse the post data
  * received form the server.
  */

 function parsePost(data) {
   let pid = data._id,
     ptitle = data.title,
     pcont = data.post,
     plikes = data.likes,
     pliked = data.liked,
     powner = data.user,
     ptags = data.tags,
     ptime = getDate(data.time);
   var card = document.createElement("div");
   card.className = "ui card";

   var image_content = document.createElement("div");
   image_content.className = "ui fluid blurring dimmable image";

   var image_dimmer = document.createElement("div");
   image_dimmer.className = "ui dimmer";
   $(image_dimmer).css("cursor", "pointer");

   var image_dcontent = document.createElement("div");
   image_dcontent.className = "content center";
   var image_dheader = document.createElement("div");
   image_dheader.className = "ui inverted icon header";
   var image_dicon = document.createElement("i");
   image_dicon.className = + ((pliked) ? "red" : "") + " heart icon";

   image_dheader.appendChild(image_dicon);
   image_dcontent.appendChild(image_dheader);
   image_dimmer.appendChild(image_dcontent);
   $(image_dheader).append((pliked) ? "Dislike :(" : "Like!");

   var img = document.createElement("img"); // post image
   img.src = pcont;

   var heart = document.createElement("span");
   heart.className = "right floated like";

   var heart_icon = document.createElement("i");
   heart_icon.className = ((pliked) ? "red" : "") + " heart icon";

   var time = document.createElement("span");
   time.className = "right floated";
   $(time).text(ptime + " ago");
   
   var content = document.createElement("div");
   content.className = "content";

   var title = document.createElement("div"); // post title
   title.className = "header";
   $(title).text(ptitle);

   var user = document.createElement("div");
   user.className = "meta";
   $(user).text(powner);

   var tags = document.createElement("div");
   tags.className = "extra content";

   ptags.forEach((e) => {
     let tag = document.createElement("a");
     tag.href = "/post/tag/" + e;
     tag.className = "ui label";
     tag.text = e;
     tags.appendChild(tag);
   });

   $(heart).click((e) => {
     update_status(pid, heart);
   });

   $(image_dimmer).click((e) => {
     update_status(pid, image_dcontent);
   });

   $(heart).append(getLikeText(plikes));
   $(heart).append(heart_icon);

   $(user).click((e) => {
     window.location = "/user/" + data.uid;
   });

   image_content.appendChild(image_dimmer);
   image_content.appendChild(img);

   title.appendChild(heart);
   user.appendChild(time);
   
   content.appendChild(title);
   content.appendChild(user);
    
   card.appendChild(content);
   card.appendChild(image_content);
   card.appendChild(tags);

   return card;
 }

 function getLikeText(likes) {
   let text = "";

   if (likes >= 999999) {
     text = (likes / 1000000.00).toFixed("1") + "M";
   } else if (likes >= 1000) {
     text = (likes / 1000.00).toFixed(1) + "K";
   } else {
     text = likes;
   }

   return text;
 }

 function getDate(milli) {
   let res = "";
   milli = Date.now() - milli;

   if (milli >= 31556952000) { // 1 year
     res += Math.round(milli / 31556952000.00) + "y ";
     milli -= milli / 31556952000.00 * 31556952000.00;
   }

   if (milli >= 604800000)
     res += Math.round(milli / 604800000.00) + "w ";
   else if (milli >= 86400000)
     res += Math.round(milli / 86400000.00) + "d ";
   else if (milli >= 3600000)
     res += Math.round(milli / 3600000.00) + "h ";
   else if (milli >= 60000)
     res += Math.round(milli / 60000.00) + "m";
   else
     res += Math.round(milli / 1000) + "s ";

   return res;
 }