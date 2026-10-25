"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, KeyRound, RefreshCw, Search, ShieldCheck, Clock3, CircleSlash, X, ChevronLeft, ChevronRight } from "lucide-react";
import { apiClient } from "@/shared/lib/api/client";
import { PROJECT_STATUS_LABELS } from "../types/api";
import s from "./project-access-code-manager.module.css";

export type ProjectAccessCodeRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  configured: boolean;
  expiresAt: string | null;
};

type IssuedCode = { code: string; expiresAt: string };
type CodeConfirmation = { project: ProjectAccessCodeRow; action: "generate" | "renew" | "revoke" };

function AccessCodeConfirmation({ confirmation, days, busy, error, onCancel, onConfirm }: {
  confirmation: CodeConfirmation; days: number; busy: boolean; error: string;
  onCancel: () => void; onConfirm: () => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const id = useId();
  const renewing = confirmation.action !== "revoke";
  const creating = confirmation.action === "generate";
  const busyRef = useRef(busy);
  const cancelRef = useRef(onCancel);
  useEffect(() => { busyRef.current = busy; cancelRef.current = onCancel; }, [busy, onCancel]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancel.current?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); if (!busyRef.current) cancelRef.current(); }
      if (event.key !== "Tab") return;
      const buttons = dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
      if (!buttons?.length) { event.preventDefault(); dialog.current?.focus(); return; }
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.current?.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !dialog.current?.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    const background = [...document.body.children].filter(node => !node.contains(dialog.current) && node instanceof HTMLElement) as HTMLElement[];
    const priorInert = background.map(node => node.inert);
    background.forEach(node => { node.inert = true; });
    document.addEventListener("keydown", keyboard);
    return () => { document.removeEventListener("keydown", keyboard); background.forEach((node, index) => { node.inert = priorInert[index]; }); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return createPortal(<div className={s.confirmOverlay} onMouseDown={event => { if (event.target === event.currentTarget && !busy) onCancel(); }}><div ref={dialog} role="alertdialog" aria-modal="true" tabIndex={-1} aria-busy={busy} className={s.confirmDialog} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
    <button type="button" className={s.confirmClose} aria-label="Cerrar confirmación" disabled={busy} onClick={onCancel}><X size={18}/></button>
    <div className={`${s.confirmIcon} ${!renewing ? s.confirmDanger : ""}`}>{renewing ? <RefreshCw size={24}/> : <CircleSlash size={24}/>}</div>
    <p className={s.confirmEyebrow}>Acceso al proyecto</p>
    <h2 id={`${id}-title`}>{creating ? "Activar acceso al proyecto" : renewing ? "Renovar código de acceso" : "Revocar código de acceso"}</h2>
    <p id={`${id}-description`} className={s.confirmDescription}>{renewing ? "Genera un nuevo código para compartir el plano de este proyecto." : "Desactiva el código que permite consultar el plano de este proyecto."}</p>
    <div className={s.confirmProject}><KeyRound size={18}/><span><small>Proyecto</small><strong>{confirmation.project.name}</strong></span></div>
    <div className={s.confirmWarning}><ShieldCheck size={18}/><p>{creating ? "El nuevo código permitirá consultar el plano y descargar las fichas del proyecto. Cópialo al generarlo y compártelo con tus clientes." : <>El código actual dejará de funcionar inmediatamente.{renewing ? " Comparte el nuevo código con las personas que necesiten acceso." : " Las personas que lo tengan ya no podrán usarlo para acceder."}</>}</p></div>
    {renewing && <p className={s.confirmValidity}><Clock3 size={15}/>Vigencia del nuevo código: <strong>{days} {days === 1 ? "día" : "días"}</strong></p>}
    {error && <p role="alert" className={s.error}>{error}</p>}
    <div className={s.confirmActions}>
      <button ref={cancel} type="button" disabled={busy} onClick={onCancel}>Cancelar</button>
      <button type="button" className={renewing ? s.confirmPrimary : s.confirmDestructive} disabled={busy} onClick={onConfirm}>{busy ? <RefreshCw size={15} className={s.spinning}/> : renewing ? <KeyRound size={16}/> : <CircleSlash size={16}/>} {busy ? "Procesando…" : creating ? "Activar y generar código" : renewing ? "Generar nuevo código" : "Revocar código"}</button>
    </div>
  </div></div>, document.body);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ProjectAccessCodeManager({
  projects,
  selectedProjectId,
}: {
  projects: ProjectAccessCodeRow[];
  selectedProjectId?: string;
}) {
  const [rows, setRows] = useState(projects);
  const [days, setDays] = useState<Record<string, number>>({});
  const [issued, setIssued] = useState<Record<string, IssuedCode>>({});
  const [busyId, setBusyId] = useState<string>();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query,setQuery] = useState("");
  const [filter,setFilter] = useState<"ALL" | "ACTIVE" | "EXPIRED" | "NONE">("ALL");
  const [copiedId,setCopiedId] = useState<string>();
  const [page,setPage] = useState(1);
  const [confirmation, setConfirmation] = useState<CodeConfirmation>();
  const stateOf = (project:ProjectAccessCodeRow) => project.configured ? "ACTIVE" : project.expiresAt ? "EXPIRED" : "NONE";
  const orderedRows = selectedProjectId
    ? [...rows].sort((a, b) => Number(b.id === selectedProjectId) - Number(a.id === selectedProjectId))
    : rows;
  const visibleRows=orderedRows.filter(project => (filter === "ALL" || stateOf(project) === filter) && `${project.name} ${project.slug}`.toLocaleLowerCase("es").includes(query.trim().toLocaleLowerCase("es")));
  const pageSize=10;
  const pageCount=Math.max(1,Math.ceil(visibleRows.length/pageSize));
  const currentPage=Math.min(page,pageCount);
  const pageStart=(currentPage-1)*pageSize;
  const pageRows=visibleRows.slice(pageStart,pageStart+pageSize);
  const counts={ALL:rows.length,ACTIVE:rows.filter(p=>stateOf(p)==="ACTIVE").length,EXPIRED:rows.filter(p=>stateOf(p)==="EXPIRED").length,NONE:rows.filter(p=>stateOf(p)==="NONE").length};

  async function generate(project: ProjectAccessCodeRow) {
    setBusyId(project.id);
    setError("");
    setNotice("");
    try {
      const result = await apiClient.post<IssuedCode>(
        `/admin/projects/${encodeURIComponent(project.id)}/site-plan/access-code`,
        { expiresInDays: days[project.id] ?? 7 },
      );
      setIssued(previous => ({ ...previous, [project.id]: result }));
      setCopiedId(undefined);
      setRows(previous => previous.map(row => row.id === project.id
        ? { ...row, configured: true, expiresAt: result.expiresAt }
        : row));
      setNotice(`Código generado para ${project.name}. Cópialo ahora; no volverá a mostrarse.`);
      setConfirmation(undefined);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo generar el código.");
    } finally {
      setBusyId(undefined);
    }
  }

  async function revoke(project: ProjectAccessCodeRow) {
    setBusyId(project.id);
    setError("");
    setNotice("");
    try {
      await apiClient.delete(`/admin/projects/${encodeURIComponent(project.id)}/site-plan/access-code`);
      setRows(previous => previous.map(row => row.id === project.id
        ? { ...row, configured: false, expiresAt: null }
        : row));
      setIssued(previous => {
        const next = { ...previous };
        delete next[project.id];
        return next;
      });
      setNotice(`Código revocado para ${project.name}.`);
      setConfirmation(undefined);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo revocar el código.");
    } finally {
      setBusyId(undefined);
    }
  }

  async function copyCode(project: ProjectAccessCodeRow) {
    const code = issued[project.id]?.code;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(project.id);
      setNotice(`Código de ${project.name} copiado.`);
    } catch {
      setError("No se pudo copiar el código. Selecciónalo y cópialo manualmente.");
    }
  }

  return <section className={s.manager} aria-label="Administrar códigos de acceso">
    {confirmation && <AccessCodeConfirmation confirmation={confirmation} days={days[confirmation.project.id] ?? 7} busy={Boolean(busyId)} error={error} onCancel={() => { if (!busyId) { setConfirmation(undefined); setError(""); } }} onConfirm={() => { if (!busyId) void (confirmation.action !== "revoke" ? generate(confirmation.project) : revoke(confirmation.project)); }}/>}
    <div className={s.summary}>
      <div><span className={s.summaryIcon}><KeyRound size={18}/></span><span><strong>{counts.ALL}</strong><small>Proyectos</small></span></div>
      <div><span className={`${s.summaryIcon} ${s.green}`}><ShieldCheck size={18}/></span><span><strong>{counts.ACTIVE}</strong><small>Con acceso activo</small></span></div>
      <div><span className={`${s.summaryIcon} ${s.amber}`}><Clock3 size={18}/></span><span><strong>{counts.EXPIRED}</strong><small>Códigos vencidos</small></span></div>
    </div>
    {error && <p role="alert" className={s.error}>{error}</p>}
    {notice && <p role="status" className={s.notice}><Check size={15}/><span>{notice}</span><button type="button" aria-label="Cerrar mensaje" onClick={()=>setNotice("")}><X size={14}/></button></p>}
    <div className={s.panel}>
      <div className={s.toolbar}>
        <label className={s.search}><Search size={16}/><input aria-label="Buscar proyecto" type="search" placeholder="Buscar proyecto…" value={query} onChange={event=>{setQuery(event.target.value);setPage(1);}}/></label>
        <div className={s.filters} role="group" aria-label="Filtrar códigos por estado">
          {([['ALL','Todos'],['ACTIVE','Activos'],['EXPIRED','Vencidos'],['NONE','Sin código']] as const).map(([key,label])=><button key={key} type="button" aria-pressed={filter===key} onClick={()=>{setFilter(key);setPage(1);}}>{label}<span>{counts[key]}</span></button>)}
        </div>
      </div>
      <div className={s.columnHead} aria-hidden="true"><span>Proyecto</span><span>Acceso al plano</span><span>Vencimiento</span><span>Vigencia y acciones</span></div>
      {!visibleRows.length && <div className={s.empty}><Search size={24}/><strong>{rows.length?'No encontramos proyectos':'Aún no hay proyectos'}</strong><p>{rows.length?'Prueba otro nombre o cambia el filtro.':'Los proyectos aparecerán aquí cuando estén registrados.'}</p>{rows.length>0&&<button type="button" onClick={()=>{setQuery("");setFilter("ALL");setPage(1);}}>Limpiar filtros</button>}</div>}
      {pageRows.map(project=>{
        const state=stateOf(project),current=issued[project.id],processing=busyId===project.id;
        const statusLabels:Record<string,string>=PROJECT_STATUS_LABELS;
        return <article key={project.id} className={`${s.project} ${project.id===selectedProjectId?s.selected:''}`}>
          <div className={s.row}>
            <div className={s.projectInfo}><span className={s.projectIcon}><KeyRound size={17}/></span><div><h2>{project.name}</h2><p>{statusLabels[project.status]??project.status}{project.id===selectedProjectId&&<span className={s.selectedLabel}>Seleccionado</span>}</p></div></div>
            <div className={s.access}><span className={`${s.badge} ${state==='ACTIVE'?s.active:state==='EXPIRED'?s.expired:s.inactive}`}>{state==='ACTIVE'?<ShieldCheck size={13}/>:state==='EXPIRED'?<Clock3 size={13}/>:<CircleSlash size={13}/>} {state==='ACTIVE'?'Activo':state==='EXPIRED'?'Vencido':'Sin código'}</span></div>
            <div className={s.expiry}>{project.expiresAt?<><span>{formatDate(project.expiresAt)}</span><small>{state==='EXPIRED'?'El acceso ha vencido':'Vencimiento del código'}</small></>:<span className={s.noDate}>Sin vencimiento asignado</span>}</div>
            <div className={s.actions}>
              <select aria-label={`Vigencia del nuevo código de ${project.name}`} disabled={Boolean(busyId)} value={days[project.id]??7} onChange={event=>setDays(previous=>({...previous,[project.id]:Number(event.target.value)}))}><option value={1}>1 día</option><option value={7}>7 días</option><option value={30}>30 días</option></select>
              <button className={s.generate} type="button" disabled={Boolean(busyId)} onClick={()=>{setError(""); setConfirmation({project,action:project.configured?"renew":"generate"});}}>{processing?<RefreshCw size={14} className={s.spinning}/>:<KeyRound size={14}/>} {processing?'Procesando…':project.configured?'Renovar':'Generar código'}</button>
              {project.configured&&<button className={s.revoke} type="button" disabled={Boolean(busyId)} onClick={()=>{setError("");setConfirmation({project,action:"revoke"});}}>Revocar</button>}
            </div>
          </div>
          {current&&<div className={s.issued}><div><span className={s.issuedLabel}>Nuevo código</span><code>{current.code}</code></div><button type="button" onClick={()=>void copyCode(project)}>{copiedId===project.id?<Check size={14}/>:<Copy size={14}/>} {copiedId===project.id?'Copiado':'Copiar código'}</button><span className={s.issuedHint}>Cópialo antes de salir. Solo se muestra en esta sesión.</span></div>}
        </article>;
      })}
      <div className={s.footer}>
        <span role="status">{visibleRows.length?pageStart+1:0}–{pageStart+pageRows.length} de {visibleRows.length} proyectos</span>
        <nav className={s.pagination} aria-label="Páginas de proyectos">
          <button type="button" disabled={currentPage===1} onClick={()=>setPage(currentPage-1)}><ChevronLeft size={14}/>Anterior</button>
          <span>Página {currentPage} de {pageCount}</span>
          <button type="button" disabled={currentPage===pageCount} onClick={()=>setPage(currentPage+1)}>Siguiente<ChevronRight size={14}/></button>
        </nav>
      </div>
    </div>
  </section>;
}
