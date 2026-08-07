import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import logoIcon from './assets/logo-icon.webp';

const DEFAULT_STUDENTS = [
    { id: 1, name: "Aguas Angulo Emely Yuleisi" },
    { id: 2, name: "Alvarez Chacon Jhoselyn" },
    { id: 3, name: "Angulo Salazar Breyner Matias" },
    { id: 4, name: "Aramburo Mosquera Jhoan Gabriel" },
    { id: 5, name: "Bonilla Marquinez Juan Jose" },
    { id: 6, name: "Camacho Roa Ariadna" },
    { id: 7, name: "Carabali Riascos Heilyn Nahiara" },
    { id: 8, name: "Correa Rosas Brihana Silena" },
    { id: 9, name: "Duque Polo Danna Sofia" },
    { id: 10, name: "Estacio Caicedo Salome" },
    { id: 11, name: "Guerrero Valencia Keilly Dahian" },
    { id: 12, name: "Lopez Marin Luis Angel" },
    { id: 13, name: "Lopez Sanchez Henderson" },
    { id: 14, name: "Mejia Caicedo Ostin Estiven" },
    { id: 15, name: "Michileno Riascos Eimy Dahian" },
    { id: 16, name: "Mina Vidal Brianna Lucia" },
    { id: 17, name: "Mondragon Angulo Santiago" },
    { id: 18, name: "Montaño Bonilla Juan Camilo" },
    { id: 19, name: "Montaño Montaño Keiner" },
    { id: 20, name: "Obando Angulo Danna Isabela" },
    { id: 21, name: "Orobio Ararat Mariangel" },
    { id: 22, name: "Perlaza Chicahiza Sebastian" },
    { id: 23, name: "Perlaza Lerma Ariany" },
    { id: 24, name: "Piedrahita Garcia Liam Emmanuel" },
    { id: 25, name: "Renteria Renteria Isabella" },
    { id: 26, name: "Riascos Riascos Jostin Estiven" },
    { id: 27, name: "Rios Espinosa Diland Stiven" },
    { id: 28, name: "Rodallega Garces Brenda Michel" },
    { id: 29, name: "Rodallega Viveros Joreli Yisel" },
    { id: 30, name: "Salgado Aguirre Isa Marhay" },
    { id: 31, name: "Torrealba Vera Delinger Elias" },
    { id: 32, name: "Triviño Castro Jowell Andres" },
    { id: 33, name: "Valencia Ararat Jeronimo" },
    { id: 34, name: "Valencia Lerma Keiner Andres" },
    { id: 35, name: "Valencia Rodriguez Yirley Sarany" },
    { id: 36, name: "Vivas Montenegro Maicol Stiwuar" },
    { id: 37, name: "Yacumal Rojas Ana Cristina" },
    { id: 38, name: "Valverde Caicedo Diego Alejandro" }
];

const DEFAULT_SUBJECTS = [
    { id: 1, name: "Matemáticas" },
    { id: 2, name: "Lengua Castellana" },
    { id: 3, name: "Ciencias Naturales" },
    { id: 4, name: "Ciencias Sociales" },
    { id: 5, name: "Inglés" },
    { id: 6, name: "Ética y Valores" },
    { id: 7, name: "Educación Física" },
    { id: 8, name: "Educación Artística" },
    { id: 9, name: "Tecnología e Informática" },
    { id: 10, name: "Religión" },
    { id: 11, name: "Democracia" },
    { id: 12, name: "Proyecto de Vida" }
];

const DEFAULT_SLOTS = [
    { id: 1, name: "Periodo 1", description: "Evaluación de desempeño, talleres y pruebas del primer periodo académico.", hasDescription: true },
    { id: 2, name: "Periodo 2", description: "Evaluación de desempeño, talleres y pruebas del segundo periodo académico.", hasDescription: true },
    { id: 3, name: "Periodo 3", description: "Evaluación de desempeño, talleres y pruebas del tercer periodo académico.", hasDescription: true },
    { id: 4, name: "Periodo 4", description: "Evaluación de desempeño, talleres y pruebas del cuarto periodo académico.", hasDescription: true },
    { id: 5, name: "Recuperación / Extra", description: "", hasDescription: false }
];

const GRADES_STORAGE_KEY = "ciudadela_desepaz_notas_3_4_v5_dark";
const CONFIG_STORAGE_KEY = "san_config_v1";

const EMPTY_CONFIG_FORM = { role: "profesor", name: "", institution: "", group: "" };

const STUDENT_HEADER_ALIASES = ["estudiante", "estudiantes", "alumno", "alumnos"];
const SUBJECT_HEADER_ALIASES = ["materia", "materias", "asignatura", "asignaturas"];

function detectDelimiter(text) {
    const firstLine = text.split(/\r?\n/)[0] || "";
    const semicolons = (firstLine.match(/;/g) || []).length;
    const commas = (firstLine.match(/,/g) || []).length;
    return semicolons > commas ? ";" : ",";
}

function parseCSV(text, delimiter) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (inQuotes) {
            if (char === '"') {
                if (text[i + 1] === '"') { field += '"'; i++; }
                else inQuotes = false;
            } else {
                field += char;
            }
        } else if (char === '"') {
            inQuotes = true;
        } else if (char === delimiter) {
            row.push(field);
            field = "";
        } else if (char === "\n") {
            row.push(field);
            rows.push(row);
            row = [];
            field = "";
        } else if (char === "\r") {
            // ignore, newline is handled by \n
        } else {
            field += char;
        }
    }
    if (field.length > 0 || row.length > 0) {
        row.push(field);
        rows.push(row);
    }
    return rows.filter(r => r.some(cell => cell.trim() !== ""));
}

function extractListsFromRows(rows) {
    if (rows.length === 0) return { students: [], subjects: [], studentColFound: false, subjectColFound: false };
    const header = rows[0].map(h => h.trim().toLowerCase());
    const studentCol = header.findIndex(h => STUDENT_HEADER_ALIASES.includes(h));
    const subjectCol = header.findIndex(h => SUBJECT_HEADER_ALIASES.includes(h));
    const students = [];
    const subjects = [];
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (studentCol !== -1 && row[studentCol] && row[studentCol].trim()) {
            students.push(row[studentCol].trim());
        }
        if (subjectCol !== -1 && row[subjectCol] && row[subjectCol].trim()) {
            subjects.push(row[subjectCol].trim());
        }
    }
    return { students, subjects, studentColFound: studentCol !== -1, subjectColFound: subjectCol !== -1 };
}

function ConfigFields({ form, onChange }) {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">¿Cuál es tu rol?</label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => onChange({ ...form, role: "profesor" })}
                        className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border ${form.role === "profesor" ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-500 shadow-lg" : "bg-slate-800/60 text-slate-300 border-slate-700/50 hover:bg-slate-800"}`}
                    >
                        Soy profesor(a)
                    </button>
                    <button
                        type="button"
                        onClick={() => onChange({ ...form, role: "estudiante" })}
                        className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border ${form.role === "estudiante" ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-500 shadow-lg" : "bg-slate-800/60 text-slate-300 border-slate-700/50 hover:bg-slate-800"}`}
                    >
                        Soy estudiante
                    </button>
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {form.role === "profesor" ? "Nombre del profesor(a)" : "Tu nombre"}
                </label>
                <input
                    type="text"
                    value={form.name}
                    onChange={(e) => onChange({ ...form, name: e.target.value })}
                    placeholder="Nombre completo"
                    className="w-full p-3 bg-slate-900/60 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-sm text-slate-200 placeholder-slate-600"
                    required
                />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Institución / Colegio</label>
                <input
                    type="text"
                    value={form.institution}
                    onChange={(e) => onChange({ ...form, institution: e.target.value })}
                    placeholder="Nombre del colegio o institución"
                    className="w-full p-3 bg-slate-900/60 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-sm text-slate-200 placeholder-slate-600"
                    required
                />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Grado o grupo</label>
                <input
                    type="text"
                    value={form.group}
                    onChange={(e) => onChange({ ...form, group: e.target.value })}
                    placeholder="Ej: Cuarto 3-4, Grado 10-A, Sexto B..."
                    className="w-full p-3 bg-slate-900/60 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-sm text-slate-200 placeholder-slate-600"
                />
            </div>
        </div>
    );
}

// Typing a grade only ever touches the currently active subject's keys for
// one student (see updateGrade/openAnnotationModal call sites), and every
// action that changes data for OTHER subjects also changes activeSubjectId,
// gradeSlots or the students/subjects arrays themselves — all of which this
// comparator already checks by reference. So comparing just this row's
// active-subject grade/annotation keys is enough to know whether the row's
// own displayed values (including "Promedio Global") are still current,
// without re-checking every subject on every render.
function areRowPropsEqual(prev, next) {
    if (prev.student !== next.student) return false;
    if (prev.index !== next.index) return false;
    if (prev.gradeSlots !== next.gradeSlots) return false;
    if (prev.activeSubjectId !== next.activeSubjectId) return false;
    if (prev.role !== next.role) return false;
    for (let i = 0; i < next.gradeSlots.length; i++) {
        const key = `${next.student.id}-${next.activeSubjectId}-${next.gradeSlots[i].id}`;
        if (prev.grades[key] !== next.grades[key]) return false;
        if (prev.annotations[key] !== next.annotations[key]) return false;
    }
    return true;
}

const StudentRow = memo(function StudentRow({
    student, index, gradeSlots, activeSubjectId, grades, annotations, role,
    updateGrade, openAnnotationModal, removeStudent,
    getGradeColor, getAvgColor, getStudentSubjectAverage, getStudentGlobalAverage
}) {
    return (
        <tr className="hover:bg-slate-800/30 transition-colors">
            <td className="sticky-col px-3 md:px-4 py-3 font-medium text-slate-200 border-r border-slate-700/50 bg-slate-900/90 backdrop-blur-sm">
                <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-slate-500 font-mono text-xs w-5 md:w-6">{index + 1}</span>
                    <span className="leading-tight text-xs md:text-sm">{student.name}</span>
                </div>
            </td>
            {gradeSlots.map(slot => {
                const gradeKey = `${student.id}-${activeSubjectId}-${slot.id}`;
                const grade = grades[gradeKey];
                const hasAnnotation = !!annotations[gradeKey];

                return (
                    <td key={slot.id} className="px-1 md:px-2 py-2 border-r border-slate-800/50 text-center relative">
                        <div className="flex items-center justify-center gap-1">
                            <input
                                type="text"
                                inputMode="decimal"
                                value={grade !== undefined ? grade : ""}
                                onChange={(e) => updateGrade(student.id, activeSubjectId, slot.id, e.target.value)}
                                className={`grade-input rounded-lg px-2 py-1 transition-colors ${getGradeColor(grade)}`}
                                placeholder="-"
                            />
                            <button
                                onClick={() => openAnnotationModal(student.id, activeSubjectId, slot.id)}
                                className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${hasAnnotation ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30' : 'text-slate-600 hover:text-slate-400 hover:bg-slate-800'}`}
                                title={hasAnnotation ? "Ver/Editar anotación" : "Agregar anotación"}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </button>
                        </div>
                    </td>
                );
            })}
            <td className={`px-2 md:px-3 py-3 font-bold text-center border-l border-slate-700/50 bg-blue-500/5 text-sm md:text-base ${getAvgColor(getStudentSubjectAverage(student.id, activeSubjectId))}`}>
                {getStudentSubjectAverage(student.id, activeSubjectId)}
            </td>
            <td className={`px-2 md:px-3 py-3 font-bold text-center border-l border-slate-700/50 bg-purple-500/5 text-sm md:text-base ${getAvgColor(getStudentGlobalAverage(student.id))}`}>
                {getStudentGlobalAverage(student.id)}
            </td>
            {role === "profesor" && (
                <td className="px-1 md:px-2 py-3 text-center">
                    <button onClick={() => removeStudent(student.id)} className="p-2 hover:bg-red-500/20 text-slate-600 hover:text-red-400 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center mx-auto" title="Eliminar estudiante">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </td>
            )}
        </tr>
    );
}, areRowPropsEqual);

function App() {
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [gradeSlots, setGradeSlots] = useState([]);
    const [grades, setGrades] = useState({});
    const [annotations, setAnnotations] = useState({});
    const [activeSubjectId, setActiveSubjectId] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [showSlotManager, setShowSlotManager] = useState(false);

    const [config, setConfig] = useState(null);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [configForm, setConfigForm] = useState(EMPTY_CONFIG_FORM);

    const [showImportModal, setShowImportModal] = useState(false);
    const [importPreview, setImportPreview] = useState(null);
    const [importSelection, setImportSelection] = useState({ students: false, subjects: false });
    const [importError, setImportError] = useState("");

    const [annotationModal, setAnnotationModal] = useState({
        isOpen: false,
        studentId: null,
        subjectId: null,
        slotId: null,
        text: ""
    });

    useEffect(() => {
        const saved = localStorage.getItem(GRADES_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            setStudents(parsed.students || DEFAULT_STUDENTS);
            setSubjects(parsed.subjects || DEFAULT_SUBJECTS);
            setGradeSlots(parsed.gradeSlots || DEFAULT_SLOTS);
            setGrades(parsed.grades || {});
            setAnnotations(parsed.annotations || {});
            if (parsed.subjects && parsed.subjects.length > 0) {
                setActiveSubjectId(parsed.subjects[0].id);
            }
        } else {
            setStudents(DEFAULT_STUDENTS);
            setSubjects(DEFAULT_SUBJECTS);
            setGradeSlots(DEFAULT_SLOTS);
            setGrades({});
            setAnnotations({});
            setActiveSubjectId(1);
        }

        const savedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
        if (savedConfig) {
            setConfig(JSON.parse(savedConfig));
        }

        setIsLoaded(true);
    }, []);

    const latestGradesDataRef = useRef(null);
    latestGradesDataRef.current = { students, subjects, gradeSlots, grades, annotations };

    // Debounced so a burst of keystrokes (typing several grades) doesn't hit
    // localStorage on every single one — flushed immediately on tab close/
    // reload below so nothing typed in the last stretch gets lost.
    useEffect(() => {
        if (!isLoaded) return;
        const handle = setTimeout(() => {
            localStorage.setItem(GRADES_STORAGE_KEY, JSON.stringify(latestGradesDataRef.current));
        }, 400);
        return () => clearTimeout(handle);
    }, [students, subjects, gradeSlots, grades, annotations, isLoaded]);

    useEffect(() => {
        const flush = () => {
            localStorage.setItem(GRADES_STORAGE_KEY, JSON.stringify(latestGradesDataRef.current));
        };
        window.addEventListener("beforeunload", flush);
        return () => window.removeEventListener("beforeunload", flush);
    }, []);

    useEffect(() => {
        if (config) {
            localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
        }
    }, [config]);

    const openConfigModal = useCallback(() => {
        setConfigForm(config || EMPTY_CONFIG_FORM);
        setShowConfigModal(true);
    }, [config]);

    const saveConfig = useCallback((e) => {
        e.preventDefault();
        if (!configForm.name.trim() || !configForm.institution.trim()) return;
        setConfig({
            role: configForm.role,
            name: configForm.name.trim(),
            institution: configForm.institution.trim(),
            group: configForm.group.trim()
        });
        setShowConfigModal(false);
    }, [configForm]);

    // Only runs once, from the first-time welcome screen — unlike saveConfig
    // (used by the later "editar configuración" modal), this is allowed to
    // seed the roster because at this point it still holds the untouched
    // DEFAULT_STUDENTS placeholder, not real data from any teacher.
    const completeOnboarding = useCallback((e) => {
        e.preventDefault();
        const name = configForm.name.trim();
        if (!name || !configForm.institution.trim()) return;
        if (configForm.role === "estudiante") {
            setStudents([{ id: 1, name }]);
        }
        setConfig({
            role: configForm.role,
            name,
            institution: configForm.institution.trim(),
            group: configForm.group.trim()
        });
    }, [configForm]);

    const updateGrade = useCallback((studentId, subjectId, slotId, value) => {
        const key = `${studentId}-${subjectId}-${slotId}`;
        
        if (value === "") {
            setGrades(prev => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
            return;
        }

        const normalizedValue = value.replace(',', '.');
        const numVal = parseFloat(normalizedValue);
        
        if (!isNaN(numVal) && numVal >= 0 && numVal <= 5) {
            setGrades(prev => ({ ...prev, [key]: normalizedValue }));
        }
    }, []);

    const openAnnotationModal = useCallback((studentId, subjectId, slotId) => {
        const key = `${studentId}-${subjectId}-${slotId}`;
        setAnnotationModal({
            isOpen: true,
            studentId,
            subjectId,
            slotId,
            text: annotations[key] || ""
        });
    }, [annotations]);

    const saveAnnotation = useCallback(() => {
        const { studentId, subjectId, slotId, text } = annotationModal;
        const key = `${studentId}-${subjectId}-${slotId}`;
        
        if (text.trim() === "") {
            setAnnotations(prev => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        } else {
            setAnnotations(prev => ({ ...prev, [key]: text.trim() }));
        }
        setAnnotationModal({ isOpen: false, studentId: null, subjectId: null, slotId: null, text: "" });
    }, [annotationModal]);

    const addGradeSlot = () => {
        const name = prompt("Nombre de la nueva casilla de nota (ej: Trabajo Final):");
        if (name && name.trim()) {
            const hasDesc = confirm("¿Desea que esta casilla tenga una descripción/explicación para el estudiante?");
            let description = "";
            if (hasDesc) {
                description = prompt("Descripción o explicación de esta nota:") || "";
            }
            const newId = Math.max(0, ...gradeSlots.map(s => s.id)) + 1;
            setGradeSlots([...gradeSlots, { id: newId, name: name.trim(), description, hasDescription: hasDesc }]);
        }
    };

    const editGradeSlot = (slotId) => {
        const slot = gradeSlots.find(s => s.id === slotId);
        const newName = prompt("Editar nombre de la casilla:", slot.name);
        if (newName && newName.trim()) {
            let newDesc = slot.description;
            let newHasDesc = slot.hasDescription;
            if (slot.hasDescription) {
                newDesc = prompt("Editar descripción:", slot.description) || "";
            } else {
                const addDesc = confirm("¿Desea agregar una descripción a esta casilla?");
                if (addDesc) {
                    newHasDesc = true;
                    newDesc = prompt("Descripción o explicación de esta nota:") || "";
                }
            }
            setGradeSlots(gradeSlots.map(s => s.id === slotId ? { ...s, name: newName.trim(), description: newDesc, hasDescription: newHasDesc } : s));
        }
    };

    const removeGradeSlot = (slotId) => {
        if (confirm("¿Está seguro de eliminar esta casilla de notas? Se borrarán todas las notas y anotaciones asociadas.")) {
            setGradeSlots(gradeSlots.filter(s => s.id !== slotId));
            setGrades(prev => {
                const next = { ...prev };
                Object.keys(next).forEach(key => {
                    if (key.endsWith(`-${slotId}`)) delete next[key];
                });
                return next;
            });
            setAnnotations(prev => {
                const next = { ...prev };
                Object.keys(next).forEach(key => {
                    if (key.endsWith(`-${slotId}`)) delete next[key];
                });
                return next;
            });
        }
    };

    const addSubject = () => {
        const name = prompt("Nombre de la nueva materia:");
        if (name && name.trim()) {
            const newId = Math.max(0, ...subjects.map(s => s.id)) + 1;
            const newSubjects = [...subjects, { id: newId, name: name.trim() }];
            setSubjects(newSubjects);
            setActiveSubjectId(newId);
        }
    };

    const editSubject = (subjectId) => {
        const subject = subjects.find(s => s.id === subjectId);
        const newName = prompt("Editar nombre de la materia:", subject.name);
        if (newName && newName.trim()) {
            setSubjects(subjects.map(s => s.id === subjectId ? { ...s, name: newName.trim() } : s));
        }
    };

    const removeSubject = (subjectId) => {
        if (confirm("¿Está seguro de eliminar esta materia? Se borrarán todas las notas y anotaciones asociadas.")) {
            const newSubjects = subjects.filter(s => s.id !== subjectId);
            setSubjects(newSubjects);
            if (activeSubjectId === subjectId && newSubjects.length > 0) {
                setActiveSubjectId(newSubjects[0].id);
            }
            setGrades(prev => {
                const next = { ...prev };
                Object.keys(next).forEach(key => {
                    if (key.includes(`-${subjectId}-`)) delete next[key];
                });
                return next;
            });
            setAnnotations(prev => {
                const next = { ...prev };
                Object.keys(next).forEach(key => {
                    if (key.includes(`-${subjectId}-`)) delete next[key];
                });
                return next;
            });
        }
    };

    const addStudent = () => {
        const name = prompt("Nombre completo del nuevo estudiante:");
        if (name && name.trim()) {
            const newId = Math.max(0, ...students.map(s => s.id)) + 1;
            setStudents([...students, { id: newId, name: name.trim() }]);
        }
    };

    const removeStudent = useCallback((studentId) => {
        if (confirm("¿Está seguro de eliminar a este estudiante? Se borrarán todas sus notas y anotaciones.")) {
            setStudents(prev => prev.filter(s => s.id !== studentId));
            setGrades(prev => {
                const next = { ...prev };
                Object.keys(next).forEach(key => {
                    if (key.startsWith(`${studentId}-`)) delete next[key];
                });
                return next;
            });
            setAnnotations(prev => {
                const next = { ...prev };
                Object.keys(next).forEach(key => {
                    if (key.startsWith(`${studentId}-`)) delete next[key];
                });
                return next;
            });
        }
    }, []);

    const closeImportModal = useCallback(() => {
        setShowImportModal(false);
        setImportPreview(null);
        setImportError("");
    }, []);

    const handleImportFile = useCallback(async (e) => {
        const fileInput = e.target;
        const file = fileInput.files[0];
        if (!file) return;
        setImportError("");
        setImportPreview(null);
        try {
            let rows;
            if (/\.xlsx?$/i.test(file.name)) {
                const XLSX = await import("xlsx");
                const buffer = await file.arrayBuffer();
                const workbook = XLSX.read(buffer, { type: "array" });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: false, defval: "" })
                    .map(row => row.map(cell => (cell === undefined || cell === null) ? "" : String(cell)));
            } else {
                const text = await file.text();
                rows = parseCSV(text, detectDelimiter(text));
            }
            const { students: foundStudents, subjects: foundSubjects, studentColFound, subjectColFound } = extractListsFromRows(rows);
            if (!studentColFound && !subjectColFound) {
                setImportError('No se encontró una columna "Estudiantes" ni "Materias" en el archivo. Revisa que la primera fila tenga esos encabezados.');
                return;
            }
            setImportPreview({ students: foundStudents, subjects: foundSubjects });
            setImportSelection({
                students: config?.role === "profesor" && foundStudents.length > 0,
                subjects: foundSubjects.length > 0
            });
        } catch (err) {
            setImportError("No se pudo leer el archivo. Verifica que sea un .csv o .xlsx válido.");
        } finally {
            fileInput.value = "";
        }
    }, [config]);

    const downloadImportTemplate = useCallback(() => {
        const rows = [
            ["Estudiantes", "Materias"],
            ["Juan Perez", "Matemáticas"],
            ["Maria Lopez", "Lengua Castellana"],
            ["", "Ciencias Naturales"]
        ];
        const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n");
        const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "plantilla_san.csv";
        a.click();
        URL.revokeObjectURL(url);
    }, []);

    const confirmImport = useCallback(() => {
        if (!importPreview) return;
        const willImportStudents = config?.role === "profesor" && importSelection.students && importPreview.students.length > 0;
        const willImportSubjects = importSelection.subjects && importPreview.subjects.length > 0;
        if (!willImportStudents && !willImportSubjects) return;

        const parts = [];
        if (willImportStudents) parts.push(`${importPreview.students.length} estudiante(s)`);
        if (willImportSubjects) parts.push(`${importPreview.subjects.length} materia(s)`);
        if (!confirm(`Vas a reemplazar ${parts.join(" y ")} con los datos del archivo. Se perderán las notas y anotaciones asociadas a lo que se reemplace. ¿Continuar?`)) {
            return;
        }

        let finalStudents = students;
        let finalSubjects = subjects;

        if (willImportStudents) {
            finalStudents = importPreview.students.map((name, idx) => ({ id: idx + 1, name }));
            setStudents(finalStudents);
        }
        if (willImportSubjects) {
            finalSubjects = importPreview.subjects.map((name, idx) => ({ id: idx + 1, name }));
            setSubjects(finalSubjects);
            setActiveSubjectId(finalSubjects[0]?.id ?? null);
        }

        const studentIds = new Set(finalStudents.map(s => s.id));
        const subjectIds = new Set(finalSubjects.map(s => s.id));
        const prune = (obj) => {
            const next = {};
            Object.keys(obj).forEach(key => {
                const [sid, subid] = key.split("-");
                if (studentIds.has(Number(sid)) && subjectIds.has(Number(subid))) {
                    next[key] = obj[key];
                }
            });
            return next;
        };
        setGrades(prev => prune(prev));
        setAnnotations(prev => prune(prev));

        closeImportModal();
    }, [importPreview, importSelection, config, students, subjects, closeImportModal]);

    const getGradeColor = useCallback((grade) => {
        if (grade === "" || grade === undefined) return "";
        const num = parseFloat(grade);
        if (num < 3.0) return "bg-red-500/10 border-red-500/40 text-red-400";
        if (num < 4.0) return "bg-amber-500/10 border-amber-500/40 text-amber-400";
        return "bg-emerald-500/10 border-emerald-500/40 text-emerald-400";
    }, []);

    const getAvgColor = useCallback((avg) => {
        if (avg === "-" || avg === "0.0") return "text-slate-500";
        const num = parseFloat(avg);
        if (num < 3.0) return "text-red-400 font-bold";
        if (num < 4.0) return "text-amber-400 font-bold";
        return "text-emerald-400 font-bold";
    }, []);

    const getStudentSubjectAverage = useCallback((studentId, subjectId) => {
        const vals = gradeSlots.map(slot => grades[`${studentId}-${subjectId}-${slot.id}`])
            .filter(g => g !== "" && g !== undefined).map(parseFloat);
        if (vals.length === 0) return "-";
        return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
    }, [grades, gradeSlots]);

    const getStudentGlobalAverage = useCallback((studentId) => {
        const vals = [];
        subjects.forEach(subj => {
            gradeSlots.forEach(slot => {
                const val = grades[`${studentId}-${subj.id}-${slot.id}`];
                if (val !== "" && val !== undefined) vals.push(parseFloat(val));
            });
        });
        if (vals.length === 0) return "-";
        return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
    }, [grades, gradeSlots, subjects]);

    const getSubjectGlobalAverage = useCallback((subjectId) => {
        const vals = [];
        students.forEach(stu => {
            gradeSlots.forEach(slot => {
                const val = grades[`${stu.id}-${subjectId}-${slot.id}`];
                if (val !== "" && val !== undefined) vals.push(parseFloat(val));
            });
        });
        if (vals.length === 0) return "-";
        return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
    }, [grades, gradeSlots, students]);

    const generalAvg = useMemo(() => {
        const vals = Object.values(grades).filter(g => g !== "" && g !== undefined).map(parseFloat);
        if (vals.length === 0) return "-";
        return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
    }, [grades]);

    if (!isLoaded) return <div className="flex items-center justify-center h-screen text-slate-500">Cargando sistema...</div>;

    if (!config) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="glass-card rounded-2xl w-full max-w-md p-6 md:p-8 border border-slate-700/50 shadow-2xl animate-fade-in">
                    <div className="flex flex-col items-center text-center mb-6">
                        <img src={logoIcon} alt="SAN" className="w-16 h-16 mb-4 drop-shadow-lg" />
                        <h1 className="text-xl font-extrabold tracking-tight gradient-text">Bienvenido a SAN</h1>
                        <p className="text-slate-400 text-sm mt-2">Antes de empezar, cuéntanos quién eres y en dónde vas a usar el sistema.</p>
                    </div>
                    <form onSubmit={completeOnboarding}>
                        <ConfigFields form={configForm} onChange={setConfigForm} />
                        <button
                            type="submit"
                            className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg glow-blue"
                        >
                            Comenzar
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-3 md:p-6 max-w-7xl mx-auto pb-20">
            <header className="mb-6 glass-card p-5 md:p-7 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <img src={logoIcon} alt="SAN" className="w-12 h-12 md:w-16 md:h-16 shrink-0 drop-shadow-lg" />
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Sistema Académico</span>
                            </div>
                            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight gradient-text">{config.institution}</h1>
                            <p className="text-slate-400 text-sm md:text-base mt-2 font-medium">Año Lectivo: {new Date().getFullYear()}</p>
                        </div>
                    </div>
                    <div className="text-right w-full md:w-auto flex items-center gap-2 justify-end">
                        <div className="inline-block bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 px-5 py-3 rounded-xl backdrop-blur-sm w-full md:w-auto text-center md:text-right">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 mb-1">{config.role === "profesor" ? "Profesor(a)" : "Estudiante"}</p>
                            <p className="text-lg md:text-xl font-bold text-white">{config.name}</p>
                            {config.group && <p className="text-xs font-medium mt-1 text-slate-400">Grado: {config.group}</p>}
                        </div>
                        <button onClick={openConfigModal} title="Editar configuración" className="p-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-white rounded-xl transition-colors shrink-0">
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </button>
                    </div>
                </div>
            </header>

            <div className="mb-5 flex flex-wrap gap-2 md:gap-3 items-center">
                <button onClick={() => setShowSummary(!showSummary)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg flex-1 md:flex-none justify-center text-sm ${showSummary ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white glow-purple' : 'bg-slate-800/60 text-purple-300 hover:bg-slate-800 border border-purple-500/20'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    Resumen
                </button>
                <button onClick={() => setShowSlotManager(!showSlotManager)} className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-800 border border-indigo-500/20 text-indigo-300 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg flex-1 md:flex-none justify-center text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                    Casillas
                </button>
                {config.role === "profesor" && (
                    <button onClick={addStudent} className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-800 border border-emerald-500/20 text-emerald-300 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg flex-1 md:flex-none justify-center text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                        Estudiante
                    </button>
                )}
                <button onClick={addSubject} className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-800 border border-blue-500/20 text-blue-300 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg flex-1 md:flex-none justify-center text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Materia
                </button>
                <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-800 border border-teal-500/20 text-teal-300 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg flex-1 md:flex-none justify-center text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m0-9l-3 3m3-3l3 3"></path></svg>
                    Importar
                </button>
                <button onClick={() => { if(confirm('¿Restaurar datos originales? Se perderán todos los cambios.')) { localStorage.removeItem(GRADES_STORAGE_KEY); window.location.reload(); } }} className="flex items-center gap-2 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 text-slate-400 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg flex-1 md:flex-none justify-center text-sm ml-auto md:ml-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    Reset
                </button>
            </div>

            {showSummary && (
                <div className="mb-6 glass-card p-5 md:p-6 rounded-2xl animate-fade-in">
                    <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                        </div>
                        Panel de Rendimiento Académico
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 rounded-xl border border-slate-700/50 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider relative">Promedio General del Grupo</p>
                            <p className={`text-5xl font-extrabold mt-3 relative ${getAvgColor(generalAvg)}`}>{generalAvg}</p>
                            <p className="text-xs text-slate-500 mt-2 relative">Sobre 5.0</p>
                        </div>
                        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 rounded-xl border border-slate-700/50">
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">Promedio por Materia</p>
                            <div className="max-h-40 overflow-y-auto scrollbar-hide space-y-2">
                                {subjects.map(subj => (
                                    <div key={subj.id} className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                                        <span className="truncate pr-2 text-slate-300">{subj.name}</span>
                                        <span className={`font-bold min-w-[40px] text-right ${getAvgColor(getSubjectGlobalAverage(subj.id))}`}>
                                            {getSubjectGlobalAverage(subj.id)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 rounded-xl border border-slate-700/50">
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">Promedio Global por Estudiante</p>
                            <div className="max-h-40 overflow-y-auto scrollbar-hide space-y-2">
                                {students.map(stu => (
                                    <div key={stu.id} className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                                        <span className="truncate pr-2 text-slate-300">{stu.name}</span>
                                        <span className={`font-bold min-w-[40px] text-right ${getAvgColor(getStudentGlobalAverage(stu.id))}`}>
                                            {getStudentGlobalAverage(stu.id)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showSlotManager && (
                <div className="mb-6 glass-card p-5 md:p-6 rounded-2xl animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">Administración de Casillas de Notas</h3>
                        <button onClick={addGradeSlot} className="text-sm bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-2 rounded-lg font-semibold hover:bg-indigo-500/30 transition-colors">
                            + Agregar Casilla
                        </button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {gradeSlots.map(slot => (
                            <div key={slot.id} className="border border-slate-700/50 rounded-xl p-4 bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-white text-sm md:text-base">{slot.name}</span>
                                    <div className="flex gap-1">
                                        <button onClick={() => editGradeSlot(slot.id)} className="p-1.5 hover:bg-blue-500/20 rounded text-blue-400 transition-colors" title="Editar">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                        </button>
                                        <button onClick={() => removeGradeSlot(slot.id)} className="p-1.5 hover:bg-red-500/20 rounded text-red-400 transition-colors" title="Eliminar">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </div>
                                </div>
                                {slot.hasDescription ? (
                                    <p className="text-xs md:text-sm text-slate-400 italic border-l-2 border-indigo-500/50 pl-2">{slot.description || "Sin descripción"}</p>
                                ) : (
                                    <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Sin descripción (Nota extra/recuperación)</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="border-b border-slate-700/50 bg-slate-900/50 p-2 flex gap-2 overflow-x-auto scrollbar-hide">
                    {subjects.map(subject => (
                        <button
                            key={subject.id}
                            onClick={() => setActiveSubjectId(subject.id)}
                            className={`px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 min-h-[44px] ${
                                activeSubjectId === subject.id 
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg glow-blue' 
                                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700/50'
                            }`}
                        >
                            {subject.name}
                            <span onClick={(e) => { e.stopPropagation(); editSubject(subject.id); }} className={`p-1 rounded hover:bg-black/20 ${activeSubjectId === subject.id ? 'text-blue-200' : 'text-slate-500'}`}>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </span>
                            <span onClick={(e) => { e.stopPropagation(); removeSubject(subject.id); }} className={`p-1 rounded hover:bg-black/20 ${activeSubjectId === subject.id ? 'text-blue-200' : 'text-slate-500'}`}>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </span>
                        </button>
                    ))}
                </div>

                <div className="overflow-x-auto max-h-[60vh] md:max-h-[65vh] scrollbar-hide">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-900/70 border-b border-slate-700/50 backdrop-blur-sm">
                            <tr>
                                <th className="sticky-corner px-3 md:px-4 py-3 font-bold text-white border-r border-slate-700/50 bg-slate-900 min-w-[140px] md:min-w-[280px]">
                                    Estudiante
                                </th>
                                {gradeSlots.map(slot => (
                                    <th key={slot.id} className="sticky-header px-1 md:px-2 py-3 min-w-[80px] md:min-w-[90px] border-r border-slate-700/50 bg-slate-900 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold text-xs">{slot.name}</span>
                                                {slot.hasDescription && (
                                                    <div className="relative has-tooltip cursor-help">
                                                        <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                        <div className="tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 md:w-64 p-3 bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg shadow-2xl z-50 text-left font-normal normal-case leading-tight">
                                                            {slot.description}
                                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </th>
                                ))}
                                <th className="sticky-header px-2 md:px-3 py-3 font-bold bg-slate-900 min-w-[70px] md:min-w-[80px] border-l border-slate-700/50 text-center">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-blue-400 text-xs">Prom.</span>
                                        <span className="text-blue-400 text-[10px]">Materia</span>
                                    </div>
                                </th>
                                <th className="sticky-header px-2 md:px-3 py-3 font-bold bg-slate-900 min-w-[70px] md:min-w-[80px] border-l border-slate-700/50 text-center">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-purple-400 text-xs">Prom.</span>
                                        <span className="text-purple-400 text-[10px]">Global</span>
                                    </div>
                                </th>
                                {config.role === "profesor" && <th className="sticky-header px-1 md:px-2 py-3 bg-slate-900 min-w-[40px] md:min-w-[50px]"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {students.map((student, index) => (
                                <StudentRow
                                    key={student.id}
                                    student={student}
                                    index={index}
                                    gradeSlots={gradeSlots}
                                    activeSubjectId={activeSubjectId}
                                    grades={grades}
                                    annotations={annotations}
                                    role={config.role}
                                    updateGrade={updateGrade}
                                    openAnnotationModal={openAnnotationModal}
                                    removeStudent={removeStudent}
                                    getGradeColor={getGradeColor}
                                    getAvgColor={getAvgColor}
                                    getStudentSubjectAverage={getStudentSubjectAverage}
                                    getStudentGlobalAverage={getStudentGlobalAverage}
                                />
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-900/80 border-t-2 border-slate-700/50 font-bold text-slate-300 text-xs md:text-sm">
                            <tr>
                                <td className="sticky-col px-3 md:px-4 py-3 border-r border-slate-700/50 bg-slate-900">Promedio de la Materia</td>
                                {gradeSlots.map(slot => (
                                    <td key={slot.id} className="px-1 md:px-2 py-3 text-center border-r border-slate-700/50 bg-slate-900">
                                        {(() => {
                                            const vals = students.map(stu => grades[`${stu.id}-${activeSubjectId}-${slot.id}`]).filter(g => g !== "" && g !== undefined).map(parseFloat);
                                            if (vals.length === 0) return "-";
                                            return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
                                        })()}
                                    </td>
                                ))}
                                <td className={`px-2 md:px-3 py-3 text-center border-l border-slate-700/50 bg-blue-500/5 ${getAvgColor(getSubjectGlobalAverage(activeSubjectId))}`}>
                                    {getSubjectGlobalAverage(activeSubjectId)}
                                </td>
                                <td className="bg-slate-900 border-l border-slate-700/50"></td>
                                <td className="bg-slate-900"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            
            <footer className="mt-8 text-center text-slate-500 text-xs md:text-sm pb-8">
                <p>Sistema de Control Académico · Alcaldía de Santiago de Cali · Secretaría de Educación</p>
            </footer>

            {showConfigModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="glass-card rounded-2xl w-full max-w-md p-6 border border-slate-700/50 shadow-2xl">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                </div>
                                Editar configuración
                            </h3>
                            <button onClick={() => setShowConfigModal(false)} className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <form onSubmit={saveConfig}>
                            <ConfigFields form={configForm} onChange={setConfigForm} />
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowConfigModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg glow-blue"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showImportModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="glass-card rounded-2xl w-full max-w-lg p-6 border border-slate-700/50 shadow-2xl">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <div className="p-2 bg-teal-500/20 rounded-lg">
                                    <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m0-9l-3 3m3-3l3 3"></path></svg>
                                </div>
                                Importar {config.role === "profesor" ? "estudiantes y materias" : "materias"}
                            </h3>
                            <button onClick={closeImportModal} className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <p className="text-sm text-slate-400 mb-4">
                            Sube un archivo <span className="text-slate-300 font-medium">.csv</span> o <span className="text-slate-300 font-medium">.xlsx</span> con una columna
                            {config.role === "profesor" ? <> "<b className="text-slate-200">Estudiantes</b>" y/o</> : null} "<b className="text-slate-200">Materias</b>".
                            {" "}
                            <button type="button" onClick={downloadImportTemplate} className="text-blue-400 hover:text-blue-300 hover:underline font-medium">
                                Descargar plantilla de ejemplo
                            </button>
                        </p>

                        <input
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleImportFile}
                            className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:font-semibold hover:file:bg-blue-700 file:cursor-pointer cursor-pointer"
                        />

                        {importError && (
                            <p className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">{importError}</p>
                        )}

                        {importPreview && (
                            <div className="mt-4 space-y-3">
                                {config.role === "profesor" && importPreview.students.length > 0 && (
                                    <label className="flex items-center gap-3 p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={importSelection.students}
                                            onChange={(e) => setImportSelection(prev => ({ ...prev, students: e.target.checked }))}
                                            className="w-4 h-4 accent-emerald-500"
                                        />
                                        <span className="text-sm text-slate-200">Importar <b>{importPreview.students.length}</b> estudiante(s) — reemplaza la lista actual</span>
                                    </label>
                                )}
                                {importPreview.subjects.length > 0 && (
                                    <label className="flex items-center gap-3 p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={importSelection.subjects}
                                            onChange={(e) => setImportSelection(prev => ({ ...prev, subjects: e.target.checked }))}
                                            className="w-4 h-4 accent-emerald-500"
                                        />
                                        <span className="text-sm text-slate-200">Importar <b>{importPreview.subjects.length}</b> materia(s) — reemplaza la lista actual</span>
                                    </label>
                                )}
                                {importPreview.students.length === 0 && importPreview.subjects.length === 0 && (
                                    <p className="text-sm text-amber-400">El archivo no tiene datos debajo de esos encabezados.</p>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={closeImportModal}
                                className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmImport}
                                disabled={!importPreview || (!importSelection.students && !importSelection.subjects)}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg font-medium hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Importar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {annotationModal.isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="glass-card rounded-2xl w-full max-w-md p-6 border border-slate-700/50 shadow-2xl">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <div className="p-2 bg-amber-500/20 rounded-lg">
                                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                </div>
                                Anotación del Estudiante
                            </h3>
                            <button onClick={() => setAnnotationModal({ isOpen: false, studentId: null, subjectId: null, slotId: null, text: "" })} className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        
                        <div className="mb-4 p-3 bg-slate-800/60 rounded-lg border border-slate-700/50 space-y-1">
                            <p className="text-sm text-slate-300">
                                <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Estudiante:</span>
                                <span className="ml-2 font-medium">{students.find(s => s.id === annotationModal.studentId)?.name}</span>
                            </p>
                            <p className="text-sm text-slate-300">
                                <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Materia:</span>
                                <span className="ml-2 font-medium">{subjects.find(s => s.id === annotationModal.subjectId)?.name}</span>
                            </p>
                            <p className="text-sm text-slate-300">
                                <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Casilla:</span>
                                <span className="ml-2 font-medium">{gradeSlots.find(s => s.id === annotationModal.slotId)?.name}</span>
                            </p>
                        </div>

                        <textarea
                            value={annotationModal.text}
                            onChange={(e) => setAnnotationModal(prev => ({ ...prev, text: e.target.value }))}
                            placeholder="Ej: Estuvo enfermo, presentó taller extemporáneo, excelente participación..."
                            className="w-full h-32 p-3 bg-slate-900/60 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none resize-none text-sm text-slate-200 placeholder-slate-600"
                        />
                        
                        <div className="flex gap-3 mt-5">
                            <button 
                                onClick={() => setAnnotationModal({ isOpen: false, studentId: null, subjectId: null, slotId: null, text: "" })}
                                className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={saveAnnotation}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg glow-amber"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
