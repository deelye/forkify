export default class Likes {
  constructor() {
    this.likes = [];
  }

  addLike(id, title, author, image) {
    const like = {
      id,
      title,
      author,
      image
    };
    this.likes.push(like);

    this.persistData();

    return like;
  }

  deleteLike(id) {
    const index = this.likes.findIndex(element => element.id === id);

    this.persistData();

    this.likes.splice(index, 1);
  }

  isLiked(id) {
    return this.likes.findIndex(element => element.id === id) !== -1;
  }

  getNumberLikes() {
    return this.likes.length;
  }

  persistData() {
    localStorage.setItem('likes', JSON.stringify(this.likes));
  }

  readStorage() {
    const storage = JSON.parse(localStorage.getItem("likes"));

    if (storage) this.likes = storage;
  }
}
