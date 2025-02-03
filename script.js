const board = document.getElementById('board');
const colors = ["#ffd1b3", "#b3e5fc", "#c8e6c9", "#fff9c4"];
const connections = [];

const drawLine = (startNote, endNote) => {
    const line = document.createElement("div");
    line.className = "connection-line";

    const updateLine = () => {
        // Проверяем, существуют ли еще заметки
        if (!startNote.isConnected || !endNote.isConnected) {
            line.remove();
            return;
        }

        const rect1 = startNote.getBoundingClientRect();
        const rect2 = endNote.getBoundingClientRect();
        const boardRect = board.getBoundingClientRect();

        // Учитываем скролл страницы
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;

        const x1 = rect1.left + rect1.width / 2 - boardRect.left + scrollX;
        const y1 = rect1.top + rect1.height / 2 - boardRect.top + scrollY;
        const x2 = rect2.left + rect2.width / 2 - boardRect.left + scrollX;
        const y2 = rect2.top + rect2.height / 2 - boardRect.top + scrollY;

        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

        line.style.width = `${length}px`;
        line.style.transform = `rotate(${angle}deg)`;
        line.style.left = `${x1}px`;
        line.style.top = `${y1}px`;
    };

    // Добавляем обработчики для обновления линий при движении заметок
    startNote.addEventListener('mousedown', () => {
        const update = () => {
            updateLine();
            if (startNote.isConnected && endNote.isConnected) {
                requestAnimationFrame(update);
            }
        };
        update();
    });

    endNote.addEventListener('mousedown', () => {
        const update = () => {
            updateLine();
            if (startNote.isConnected && endNote.isConnected) {
                requestAnimationFrame(update);
            }
        };
        update();
    });

    // Вызываем updateLine сразу после создания
    requestAnimationFrame(updateLine);

    board.appendChild(line);
    connections.push([line, startNote, endNote]);
};

const addNote = (text) => {
    const note = document.createElement("div");
    note.className = "note";
    note.textContent = text;
    note.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

    note.addEventListener("mousedown", startDrag);

    note.addEventListener("dblclick", () => {
        // Удаляем все связанные линии
        connections.forEach(([line, start, end], index) => {
            if (start === note || end === note) {
                line.remove();
                connections.splice(index, 1);
            }
        });
        board.removeChild(note);
    });

    note.style.left = `${Math.random() * (board.offsetWidth - 150)}px`;
    note.style.top = `${Math.random() * (board.offsetHeight - 100)}px`;

    board.appendChild(note);

    // Проверяем наличие других заметок
    const notes = Array.from(board.children).filter(child => child.classList.contains('note'));
    if (notes.length > 1) {
        const prevNote = notes[notes.length - 2];
        drawLine(prevNote, note);
    }
};

let currentNote = null;
let offsetX = 0;
let offsetY = 0;

const startDrag = (e) => {
    currentNote = e.target;
    const rect = currentNote.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    document.addEventListener("mousemove", moveNote);
    document.addEventListener("mouseup", stopDrag);
};

const moveNote = (e) => {
    if (!currentNote) return;

    const boardRect = board.getBoundingClientRect();
    const x = e.clientX - boardRect.left - offsetX;
    const y = e.clientY - boardRect.top - offsetY;

    const maxX = boardRect.width - currentNote.offsetWidth;
    const maxY = boardRect.height - currentNote.offsetHeight;

    currentNote.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
    currentNote.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
};

const stopDrag = () => {
    currentNote = null;
    document.removeEventListener("mousemove", moveNote);
    document.removeEventListener("mouseup", stopDrag);
};

const addBtn = document.getElementById("add-btn");
const noteInput = document.getElementById("note-input");

addBtn.addEventListener("click", () => {
    const text = noteInput.value.trim();
    if (text) {
        addNote(text);
        noteInput.value = "";
    }
});

noteInput.addEventListener("keypress", (e) => {
    const text = noteInput.value.trim();
    if (e.key === "Enter" && text) {
        addNote(text);
        noteInput.value = "";
    }
});