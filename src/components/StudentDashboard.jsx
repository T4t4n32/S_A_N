import { useCallback } from 'react';

function dotColorForAvg(avg) {
    if (avg === "-") return "bg-slate-600";
    const num = parseFloat(avg);
    if (num < 3.0) return "bg-red-400";
    if (num < 4.0) return "bg-amber-400";
    return "bg-emerald-400";
}

function SubjectCard({
    subject, isOpen, onToggle, gradeSlots, studentId, grades, annotations,
    updateGrade, openAnnotationModal, getGradeColor, getAvgColor, subjectAverage
}) {
    return (
        <div className="glass-card rounded-2xl overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-slate-800/30 transition-colors"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColorForAvg(subjectAverage)}`}></div>
                    <span className="font-bold text-white text-sm md:text-base truncate">{subject.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-lg md:text-xl font-bold ${getAvgColor(subjectAverage)}`}>{subjectAverage}</span>
                    <svg className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
            </button>
            {isOpen && (
                <div className="border-t border-slate-700/50 divide-y divide-slate-800/50 animate-fade-in">
                    {gradeSlots.map(slot => {
                        const key = `${studentId}-${subject.id}-${slot.id}`;
                        const grade = grades[key];
                        const note = annotations[key];
                        return (
                            <div key={slot.id} className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-200 text-sm">{slot.name}</p>
                                    {slot.hasDescription && slot.description && (
                                        <p className="text-xs text-slate-500 mt-0.5">{slot.description}</p>
                                    )}
                                    <button
                                        onClick={() => openAnnotationModal(studentId, subject.id, slot.id)}
                                        className="mt-1.5 text-left w-full"
                                    >
                                        {note ? (
                                            <span className="inline-flex items-start gap-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5">
                                                <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                <span className="italic">{note}</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                                Agregar nota: ¿a qué trabajo corresponde esta nota?
                                            </span>
                                        )}
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={grade !== undefined ? grade : ""}
                                    onChange={(e) => updateGrade(studentId, subject.id, slot.id, e.target.value)}
                                    className={`grade-input rounded-lg px-3 py-2.5 w-full sm:w-20 text-center text-base font-semibold shrink-0 transition-colors ${getGradeColor(grade)}`}
                                    placeholder="-"
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function StudentDashboard({
    studentId, studentName, subjects, gradeSlots, grades, annotations,
    expandedSubjectId, setExpandedSubjectId,
    updateGrade, openAnnotationModal,
    getGradeColor, getAvgColor, getStudentSubjectAverage, getStudentGlobalAverage
}) {
    const firstName = studentName.trim().split(/\s+/)[0] || studentName;
    const globalAvg = getStudentGlobalAverage(studentId);

    const toggleSubject = useCallback((subjectId) => {
        setExpandedSubjectId(prev => prev === subjectId ? null : subjectId);
    }, [setExpandedSubjectId]);

    return (
        <div className="space-y-4">
            <div className="glass-card rounded-2xl p-5 md:p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
                    <div className="text-center sm:text-left">
                        <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-1">Tu panorama académico</p>
                        <h2 className="text-2xl font-extrabold text-white">Hola, {firstName} 👋</h2>
                        <p className="text-slate-400 text-sm mt-1">
                            {subjects.length === 0
                                ? "Aún no tienes materias registradas"
                                : `${subjects.length} materia${subjects.length !== 1 ? 's' : ''} registrada${subjects.length !== 1 ? 's' : ''}`}
                        </p>
                    </div>
                    <div className="text-center bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl px-6 py-3 shrink-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-1">Promedio General</p>
                        <p className={`text-4xl font-extrabold ${getAvgColor(globalAvg)}`}>{globalAvg}</p>
                        <p className="text-[10px] text-slate-500">Sobre 5.0</p>
                    </div>
                </div>
            </div>

            {subjects.length === 0 ? (
                <div className="glass-card rounded-2xl p-10 text-center text-slate-400">
                    <p className="text-sm">Usa el botón <span className="text-blue-300 font-semibold">+ Materia</span> arriba para agregar tu primera materia y empezar a registrar tus notas.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {subjects.map(subject => (
                        <SubjectCard
                            key={subject.id}
                            subject={subject}
                            isOpen={expandedSubjectId === subject.id}
                            onToggle={() => toggleSubject(subject.id)}
                            gradeSlots={gradeSlots}
                            studentId={studentId}
                            grades={grades}
                            annotations={annotations}
                            updateGrade={updateGrade}
                            openAnnotationModal={openAnnotationModal}
                            getGradeColor={getGradeColor}
                            getAvgColor={getAvgColor}
                            subjectAverage={getStudentSubjectAverage(studentId, subject.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
