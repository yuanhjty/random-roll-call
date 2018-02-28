(() => {
  // 获取要操作的 DOM 元素
  const rollItems = document.querySelectorAll('.roll-item');
  const controlButton = document.querySelector('.control-btn');
  const fileInput = document.querySelector('#file');
  const fileLabel = document.querySelector('#file+label');

  // 数据
  const names = [
    [
      { 姓名: 'AAA' },
      { 姓名: 'BBB' },
      { 姓名: 'CCC' },
      { 姓名: 'DDD' },
      { 姓名: 'EEE' },
      { 姓名: 'FFF' },
      { 姓名: 'GGG' },
      { 姓名: 'HHH' },
      { 姓名: 'III' },
      { 姓名: 'JJJ' }
    ]
  ];
  let currentItem = rollItems[1];
  let intervalHandle = null;

  // 获得随机数
  function getRandNumber(lower, upper) {
    return Math.floor(lower + (upper - lower) * Math.random());
  }

  function resetRollItems(params) {
    rollItems.forEach(item => {
      item.firstChild.nodeValue = ' ';
    });
  }

  // 切换按钮状态
  function toggleButton(button) {
    button.classList.toggle('stop-btn');
    button.classList.toggle('start-btn');
  }

  // 随机滚动条目
  function randRoll(contents) {
    if (!contents || !Array.isArray(contents)) {
      throw new Error('need an array of contents as parameter');
    }

    rollItems.forEach((item, index, items) => {
      let top = item.offsetTop;
      item.style.top = top - 1 + 'px';
      if (item.offsetTop < -50) {
        item.firstChild.nodeValue = `${
          contents[getRandNumber(0, contents.length)]
        }`;
        item.style.top = '101px';
        currentItem = items[(index + 2) % 3];
      }
    });
  }

  // 处理文件输入事件
  function handleFileInput(event) {
    let file = event.target.files[0];
    let fileReader = new FileReader();

    if (!file) {
      // do nothing
    } else if (!/\.xl(s[xmb]|t[xm]|am)$/.test(file.name)) {
      alert('请选择 Excel 文件');
    } else {
      fileLabel.firstChild.nodeValue = file.name;
      new Promise((resolve, reject) => {
        fileReader.onload = function(progressEvent) {
          try {
            let data = progressEvent.target.result;
            let workbook = XLSX.read(data, {
              type: 'binary'
            });
            let sheets = workbook.Sheets;

            names.length = 0;
            for (let sheet in sheets) {
              if (sheets.hasOwnProperty(sheet)) {
                names.push(XLSX.utils.sheet_to_json(sheets[sheet]));
              }
            }

            resetRollItems();
            resolve();
          } catch (error) {
            reject(error);
          }
        };

        fileReader.readAsBinaryString(file);
      })
        .then(() => {
          controlButton.disabled = false;
        })
        .catch(error => {
          throw error;
        });
    }
  }

  // 处理控制按钮点击事件
  function handleButtonClick() {
    if (intervalHandle !== null) {
      fileInput.disabled = false;
      fileLabel.disabled = false;

      toggleButton(controlButton);
      clearInterval(intervalHandle);
      intervalHandle = null;

      // 滚动停止时，让 currentItem 停靠到视窗中央
      if (currentItem.offsetTop > 0) {
        let delta = currentItem.offsetTop;
        rollItems.forEach(number => {
          let top = number.offsetTop;
          number.style.top = top - delta + 'px';
        });
      }
    } else {
      fileInput.disabled = true;
      fileLabel.disabled = true;

      toggleButton(controlButton);
      intervalHandle = setInterval(() => {
        randRoll(names[0].map(item => item['姓名']));
      }, 2);
    }
  }

  fileInput.addEventListener('change', handleFileInput);
  controlButton.addEventListener('click', handleButtonClick);
})();
