/**
 * 五子棋游戏引擎
 * 包含游戏核心逻辑和界面渲染
 */

// ==================== 游戏常量 ====================
const BOARD_SIZE = 15;           // 棋盘大小 15x15
const GRID_SIZE = 40;            // 每个格子大小
const PADDING = 20;              // 棋盘边缘留白
const STONE_RADIUS = 17;         // 棋子半径

const BLACK = 1;                 // 黑棋
const WHITE = 2;                 // 白棋
const EMPTY = 0;                 // 空

// ==================== 游戏状态 ====================
let board = [];                  // 棋盘二维数组
let currentPlayer = BLACK;       // 当前执棋方
let gameOver = false;            // 游戏是否结束
let moveHistory = [];            // 落子历史记录

// ==================== DOM 元素 ====================
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const currentPlayerEl = document.getElementById('current-player');
const btnRestart = document.getElementById('btn-restart');
const btnUndo = document.getElementById('btn-undo');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalBtn = document.getElementById('modal-btn');

// ==================== 游戏初始化 ====================
/**
 * 初始化游戏
 */
function initGame() {
    // 初始化棋盘数组
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY));

    // 重置游戏状态
    currentPlayer = BLACK;
    gameOver = false;
    moveHistory = [];

    // 绘制棋盘
    drawBoard();

    // 更新界面
    updateUI();
}

/**
 * 绘制棋盘
 */
function drawBoard() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制木纹背景
    drawWoodBackground();

    // 绘制网格线
    drawGrid();

    // 绘制棋子
    drawStones();

    // 绘制最后一步的标记
    drawLastMoveMarker();
}

/**
 * 绘制木纹背景
 */
function drawWoodBackground() {
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 添加简单的纹理效果
    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
    for (let i = 0; i < canvas.width; i += 4) {
        ctx.fillRect(i, 0, 2, canvas.height);
    }
}

/**
 * 绘制网格线
 */
function drawGrid() {
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;

    for (let i = 0; i < BOARD_SIZE; i++) {
        // 横线
        ctx.beginPath();
        ctx.moveTo(PADDING, PADDING + i * GRID_SIZE);
        ctx.lineTo(PADDING + (BOARD_SIZE - 1) * GRID_SIZE, PADDING + i * GRID_SIZE);
        ctx.stroke();

        // 竖线
        ctx.beginPath();
        ctx.moveTo(PADDING + i * GRID_SIZE, PADDING);
        ctx.lineTo(PADDING + i * GRID_SIZE, PADDING + (BOARD_SIZE - 1) * GRID_SIZE);
        ctx.stroke();
    }

    // 绘制天元和星位点
    drawStarPoints();
}

/**
 * 绘制星位（天元和四个角的星位）
 */
function drawStarPoints() {
    const starPoints = [
        [3, 3], [11, 3],     // 上方
        [7, 7],               // 天元
        [3, 11], [11, 11]    // 下方
    ];

    ctx.fillStyle = '#333333';

    starPoints.forEach(([x, y]) => {
        const cx = PADDING + x * GRID_SIZE;
        const cy = PADDING + y * GRID_SIZE;
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

/**
 * 绘制所有棋子
 */
function drawStones() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] !== EMPTY) {
                drawStone(row, col, board[row][col]);
            }
        }
    }
}

/**
 * 绘制单个棋子
 * @param {number} row - 行索引
 * @param {number} col - 列索引
 * @param {number} type - 棋子类型（BLACK 或 WHITE）
 */
function drawStone(row, col, type) {
    const x = PADDING + col * GRID_SIZE;
    const y = PADDING + row * GRID_SIZE;

    // 创建渐变效果（立体感）
    const gradient = ctx.createRadialGradient(
        x - 5, y - 5, 0,
        x, y, STONE_RADIUS
    );

    if (type === BLACK) {
        gradient.addColorStop(0, '#666666');
        gradient.addColorStop(1, '#000000');
    } else {
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(1, '#DDDDDD');
    }

    // 绘制阴影
    ctx.beginPath();
    ctx.arc(x + 2, y + 2, STONE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fill();

    // 绘制棋子
    ctx.beginPath();
    ctx.arc(x, y, STONE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // 白棋加边框
    if (type === WHITE) {
        ctx.strokeStyle = '#CCCCCC';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

/**
 * 绘制最后一步的标记
 */
function drawLastMoveMarker() {
    if (moveHistory.length === 0) return;

    const lastMove = moveHistory[moveHistory.length - 1];
    const x = PADDING + lastMove.col * GRID_SIZE;
    const y = PADDING + lastMove.row * GRID_SIZE;

    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 2;

    // 绘制红色小十字标记
    const markerSize = 6;
    ctx.beginPath();
    ctx.moveTo(x - markerSize, y);
    ctx.lineTo(x + markerSize, y);
    ctx.moveTo(x, y - markerSize);
    ctx.lineTo(x, y + markerSize);
    ctx.stroke();
}

// ==================== 游戏逻辑 ====================

/**
 * 处理棋盘点击
 * @param {MouseEvent} event - 鼠标事件
 */
function handleBoardClick(event) {
    if (gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 考虑 Canvas 的缩放比例
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const actualX = x * scaleX;
    const actualY = y * scaleY;

    // 计算最近的交叉点
    const col = Math.round((actualX - PADDING) / GRID_SIZE);
    const row = Math.round((actualY - PADDING) / GRID_SIZE);

    // 验证落子位置
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
        return;
    }

    if (board[row][col] !== EMPTY) {
        return;
    }

    // 落子
    placePiece(row, col);
}

/**
 * 落子
 * @param {number} row - 行索引
 * @param {number} col - 列索引
 */
function placePiece(row, col) {
    board[row][col] = currentPlayer;
    moveHistory.push({ row, col, player: currentPlayer });

    drawBoard();

    // 检查胜负
    if (checkWin(row, col)) {
        gameOver = true;
        showWinModal(currentPlayer);
        return;
    }

    // 切换执棋方
    currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
    updateUI();
}

/**
 * 检查是否获胜
 * @param {number} row - 最后落子的行索引
 * @param {number} col - 最后落子的列索引
 * @returns {boolean} 是否获胜
 */
function checkWin(row, col) {
    const player = board[row][col];

    // 四个方向：横、竖、主对角线、副对角线
    const directions = [
        [0, 1],   // 横向
        [1, 0],   // 纵向
        [1, 1],   // 主对角线（左上到右下）
        [1, -1]   // 副对角线（右上到左下）
    ];

    for (const [dr, dc] of directions) {
        let count = 1;

        // 向正方向计数
        let r = row + dr;
        let c = col + dc;
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
            count++;
            r += dr;
            c += dc;
        }

        // 向反方向计数
        r = row - dr;
        c = col - dc;
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
            count++;
            r -= dr;
            c -= dc;
        }

        if (count >= 5) {
            return true;
        }
    }

    return false;
}

/**
 * 悔棋
 */
function undoMove() {
    if (gameOver || moveHistory.length === 0) {
        return;
    }

    const lastMove = moveHistory.pop();
    board[lastMove.row][lastMove.col] = EMPTY;
    currentPlayer = lastMove.player;

    drawBoard();
    updateUI();
}

/**
 * 更新界面显示
 */
function updateUI() {
    // 更新当前执棋方显示
    currentPlayerEl.textContent = `当前执棋：${currentPlayer === BLACK ? '黑方' : '白方'}`;

    // 更新玩家信息的高亮状态
    const players = document.querySelectorAll('.player');
    players.forEach((player, index) => {
        if ((index === 0 && currentPlayer === BLACK) || (index === 1 && currentPlayer === WHITE)) {
            player.classList.add('active');
        } else {
            player.classList.remove('active');
        }
    });

    // 更新按钮状态
    btnUndo.disabled = moveHistory.length === 0 || gameOver;
}

/**
 * 显示获胜弹窗
 * @param {number} winner - 获胜方
 */
function showWinModal(winner) {
    const winnerName = winner === BLACK ? '黑方' : '白方';
    modalTitle.textContent = '游戏结束';
    modalMessage.textContent = `${winnerName}获胜！`;
    modal.classList.remove('hidden');
}

/**
 * 隐藏弹窗
 */
function hideModal() {
    modal.classList.add('hidden');
}

// ==================== 事件监听 ====================

// 棋盘点击事件
canvas.addEventListener('click', handleBoardClick);

// 重新开始按钮
btnRestart.addEventListener('click', () => {
    initGame();
});

// 悔棋按钮
btnUndo.addEventListener('click', undoMove);

// 弹窗按钮
modalBtn.addEventListener('click', () => {
    hideModal();
    initGame();
});

// ==================== 启动游戏 ====================
initGame();
