const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const playlist = $(".playlist");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const togglePlayBtn = $(".btn-toggle-play");
const player = $(".player");
const currentTime = $("#current-time");
const duration = $("#duration");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const ramdomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");

const STORAGE_KEY = "HOLE_MUSIC_STORAGE_KEY";

const convertToTimeString = function (value) {
  let minutes = Math.floor(value / 60);
  let seconds = Math.floor(value - minutes * 60);
  const timeString =
    minutes.toString().padStart(2, "0") +
    ":" +
    seconds.toString().padStart(2, "0");

  return timeString;
};

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(STORAGE_KEY)) || {},
  songs: [
    {
      id: 0,
      name: "Chúng ta của hiện tại",
      singer: "Sơn Tùng MTP",
      path: "/assets/audio/chungtacuatuonglai.mp3",
      image: "/assets/img/chungtacuatuonglai.png",
    },
    {
      id: 1,
      name: "Nữ siêu anh hùng",
      singer: "tlinh",
      path: "/assets/audio/nusieuanhhung.mp3",
      image: "/assets/img/nusieuanhhung.png",
    },
    {
      id: 2,
      name: "Xin lỗi",
      singer: "Thắng",
      path: "/assets/audio/xinloi.mp3",
      image: "/assets/img/xinloi.png",
    },
    {
      id: 3,
      name: "Đừng để nước mắt rơi",
      singer: "VSTRA",
      path: "/assets/audio/dungdenuocmatroi.mp3",
      image: "/assets/img/dungdenuocmatroi.png",
    },
    {
      id: 4,
      name: "Sài Gòn ơi",
      singer: "Obito",
      path: "/assets/audio/saigonoi.mp3",
      image: "/assets/img/saigonoi.png",
    },
    {
      id: 5,
      name: "Blue",
      singer: "BIGBANG",
      path: "/assets/audio/blue.mp3",
      image: "/assets/img/blue.png",
    },
    {
      id: 6,
      name: "Trước khi em tồn tại",
      singer: "Thắng",
      path: "/assets/audio/truockhiemtontai.mp3",
      image: "/assets/img/xinloi.png",
    },
    {
      id: 7,
      name: "Ngồi nhìn em khóc",
      singer: "Sáo",
      path: "/assets/audio/ngoinhinemkhoc.mp3",
      image: "/assets/img/ngoinhinemkhoc.png",
    },
  ],
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
  },

  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
              <div data-index="${index}" class="song ${
        index === this.currentIndex ? "active" : ""
      }">
                <div
                  class="thumb"
                  style="background-image: url('${song.image}');"
                ></div>
                <div class="body">
                  <h3 class="title">${song.name}</h3>
                  <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                  <i class="fas fa-ellipsis-h"></i>
                </div>
              </div>
            `;
    });

    playlist.innerHTML = htmls.join("");
  },

  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },

  handleEvents: function () {
    const cdWidth = cd.offsetWidth;
    const _this = this;

    // Xử lí quay / dừng đĩa CD
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000,
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    // Phóng to thu nhỏ CD khi cuộn
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // Xử lí phát / dừng nhạc
    togglePlayBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // Lắng nghe khi bài hát được phát
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    // Lắng nghe khi bài hát bị dừng
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    // Cập nhật thời gian hiện tại khi vị trí bài hát thay đổi
    audio.ontimeupdate = function () {
      const timeString = convertToTimeString(audio.currentTime);
      currentTime.textContent = timeString;

      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };

    // Lắng nghe khi trình duyệt tải đủ dữ liệu của bài hát
    audio.onloadedmetadata = function () {
      const timeString = convertToTimeString(audio.duration);
      duration.textContent = timeString;
    };

    // Xử lí khi tua bài hát
    progress.onchange = function (e) {
      const seekTime = audio.duration * (e.target.value / 100);
      audio.currentTime = seekTime;
    };

    // Lùi bài hát
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Chuyển tiếp bài hát
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Kích hoạt chế độ phát ngẫu nhiên
    ramdomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      this.classList.toggle("active", _this.isRandom);
    };

    // Kích hoạt chế độ phát lặp lại
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      this.classList.toggle("active", _this.isRepeat);
    };

    // Tự động chuyển tiếp khi bài hát kết thúc
    audio.onended = function () {
      if (_this.isRepeat) {
        this.play();
      } else {
        nextBtn.click();
      }
    };

    // Lắng nghe hành vi click vào playlist
    playlist.onclick = function (e) {
      const songNotActive = e.target.closest(".song:not(.active)");

      if (songNotActive || e.target.closest(".option")) {
        if (songNotActive) {
          _this.currentIndex = Number(songNotActive.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }
      }
    };
  },

  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },

  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);

    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.background = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
    duration.textContent = "0:00";
  },

  loadConfig: function () {
    this.isRepeat = this.config.isRepeat;
    this.isRandom = this.config.isRandom;
  },

  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 500);
  },

  start: function () {
    // Tải thông tin cấu hình
    this.loadConfig();

    // Định nghĩa các thuộc tính cho object
    this.defineProperties();

    // Tải thông tin tin bài hát đầu tiên vào UI chạy ứng dụng
    this.loadCurrentSong();

    // Lắng nghe / xử lí các sự kiện (DOM events)
    this.handleEvents();

    // Render playlist
    this.render();

    ramdomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  },
};

app.start();
