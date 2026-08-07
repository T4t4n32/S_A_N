export default function PrintReport({
    role, institution, name, group, periodName,
    subjects, gradeSlots, students, grades, annotations,
    getStudentSubjectAverage, getStudentGlobalAverage, getSubjectGlobalAverage, generalAvg,
    onClose
}) {
    const studentId = students[0]?.id;
    const today = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="min-h-screen bg-white text-slate-900">
            <div className="print:hidden sticky top-0 z-10 bg-slate-900 border-b border-slate-700/50 p-4 flex justify-between items-center gap-3">
                <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Volver
                </button>
                <button onClick={() => window.print()} className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-sm transition-all shadow-lg flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a1 1 0 001-1v-4a1 1 0 00-1-1H9a1 1 0 00-1 1v4a1 1 0 001 1zm8-12V5a2 2 0 00-2-2H7a2 2 0 00-2 2v4h14z"></path></svg>
                    Imprimir / Guardar como PDF
                </button>
            </div>

            <div className="max-w-4xl mx-auto p-6 md:p-10">
                <header className="mb-8 border-b-2 border-slate-800 pb-4">
                    <h1 className="text-2xl font-bold">{institution}</h1>
                    <p className="text-sm text-slate-600 mt-1 font-medium">
                        {role === "profesor" ? "Informe de Calificaciones — Grupo" : "Mi Informe de Calificaciones"}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                        <p><span className="font-semibold">{role === "profesor" ? "Profesor(a):" : "Estudiante:"}</span> {name}</p>
                        {group && <p><span className="font-semibold">Grado/Grupo:</span> {group}</p>}
                        <p><span className="font-semibold">Periodo académico:</span> {periodName}</p>
                        <p><span className="font-semibold">Generado:</span> {today}</p>
                    </div>
                </header>

                {subjects.length === 0 ? (
                    <p className="text-slate-500 text-sm">No hay materias registradas en este periodo.</p>
                ) : role === "profesor" ? (
                    <>
                        {subjects.map(subject => (
                            <section key={subject.id} className="mb-8 break-inside-avoid">
                                <h2 className="text-base font-bold mb-2 bg-slate-100 px-3 py-1.5 rounded">{subject.name}</h2>
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-slate-800">
                                            <th className="text-left py-1.5 pr-2 font-semibold">Estudiante</th>
                                            {gradeSlots.map(slot => (
                                                <th key={slot.id} className="text-center py-1.5 px-1 font-semibold">{slot.name}</th>
                                            ))}
                                            <th className="text-center py-1.5 pl-2 font-semibold">Prom.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map(stu => (
                                            <tr key={stu.id} className="border-b border-slate-200">
                                                <td className="py-1 pr-2">{stu.name}</td>
                                                {gradeSlots.map(slot => {
                                                    const g = grades[`${stu.id}-${subject.id}-${slot.id}`];
                                                    return <td key={slot.id} className="text-center py-1 px-1">{g !== undefined && g !== "" ? g : "-"}</td>;
                                                })}
                                                <td className="text-center py-1 pl-2 font-semibold">{getStudentSubjectAverage(stu.id, subject.id)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t-2 border-slate-800 font-bold">
                                            <td className="py-1.5 pr-2">Promedio del grupo</td>
                                            <td colSpan={gradeSlots.length}></td>
                                            <td className="text-center py-1.5 pl-2">{getSubjectGlobalAverage(subject.id)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </section>
                        ))}
                        <div className="mt-8 pt-4 border-t-2 border-slate-800 text-right">
                            <p className="text-lg font-bold">Promedio general del grupo: {generalAvg}</p>
                        </div>
                    </>
                ) : (
                    <>
                        {subjects.map(subject => (
                            <section key={subject.id} className="mb-6 break-inside-avoid">
                                <h2 className="text-base font-bold mb-2 bg-slate-100 px-3 py-1.5 rounded flex justify-between">
                                    <span>{subject.name}</span>
                                    <span>{getStudentSubjectAverage(studentId, subject.id)}</span>
                                </h2>
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-slate-800">
                                            <th className="text-left py-1.5 font-semibold">Nota</th>
                                            <th className="text-center py-1.5 w-24 font-semibold">Calificación</th>
                                            <th className="text-left py-1.5 pl-4 font-semibold">Anotación</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {gradeSlots.map(slot => {
                                            const key = `${studentId}-${subject.id}-${slot.id}`;
                                            const g = grades[key];
                                            const note = annotations[key];
                                            return (
                                                <tr key={slot.id} className="border-b border-slate-200">
                                                    <td className="py-1">{slot.name}</td>
                                                    <td className="text-center py-1 font-semibold">{g !== undefined && g !== "" ? g : "-"}</td>
                                                    <td className="py-1 pl-4 text-slate-600 italic">{note || "—"}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </section>
                        ))}
                        <div className="mt-8 pt-4 border-t-2 border-slate-800 text-right">
                            <p className="text-lg font-bold">Promedio general: {generalAvg}</p>
                        </div>
                    </>
                )}

                <footer className="mt-10 pt-4 border-t border-slate-300 text-xs text-slate-500 text-center">
                    Generado con SAN — Sistema de Asignación de Notas
                </footer>
            </div>
        </div>
    );
}
