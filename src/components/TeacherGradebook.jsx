import { memo } from 'react';

// Typing a grade only ever touches the currently active subject's keys for
// one student (see updateGrade/openAnnotationModal call sites in App.jsx),
// and every action that changes data for OTHER subjects also changes
// activeSubjectId, gradeSlots or the students/subjects arrays themselves —
// all of which this comparator already checks by reference. So comparing
// just this row's active-subject grade/annotation keys is enough to know
// whether the row's own displayed values (including "Promedio Global") are
// still current, without re-checking every subject on every render.
function areRowPropsEqual(prev, next) {
    if (prev.student !== next.student) return false;
    if (prev.index !== next.index) return false;
    if (prev.gradeSlots !== next.gradeSlots) return false;
    if (prev.activeSubjectId !== next.activeSubjectId) return false;
    for (let i = 0; i < next.gradeSlots.length; i++) {
        const key = `${next.student.id}-${next.activeSubjectId}-${next.gradeSlots[i].id}`;
        if (prev.grades[key] !== next.grades[key]) return false;
        if (prev.annotations[key] !== next.annotations[key]) return false;
    }
    return true;
}

const StudentRow = memo(function StudentRow({
    student, index, gradeSlots, activeSubjectId, grades, annotations,
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
            <td className="px-1 md:px-2 py-3 text-center">
                <button onClick={() => removeStudent(student.id)} className="p-2 hover:bg-red-500/20 text-slate-600 hover:text-red-400 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center mx-auto" title="Eliminar estudiante">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </td>
        </tr>
    );
}, areRowPropsEqual);

export default function TeacherGradebook({
    subjects, activeSubjectId, setActiveSubjectId, editSubject, removeSubject,
    gradeSlots, students, grades, annotations,
    updateGrade, openAnnotationModal, removeStudent,
    getGradeColor, getAvgColor, getStudentSubjectAverage, getStudentGlobalAverage, getSubjectGlobalAverage,
    generalAvg, showSummary
}) {
    return (
        <>
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
                                <th className="sticky-header px-1 md:px-2 py-3 bg-slate-900 min-w-[40px] md:min-w-[50px]"></th>
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
        </>
    );
}
