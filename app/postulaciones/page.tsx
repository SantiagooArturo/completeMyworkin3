"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Building,
  MapPin,
  Clock,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  DollarSign,
  Play,
  FileText,
  Target,
  Mic,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { collection, getDocs, query, where, doc, deleteDoc, addDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { db2 } from "@/firebase/config-jobs"; // Asegúrate de importar db2 correctamente

// Tipos para las columnas
type ColumnType =
  | "guardados"
  | "postulados"
  | "entrevistas"
  | "rechazados"
  | "aceptados";

export interface JobApplication {
  id: number;
  firestoreId?: string; // <-- Agregado para almacenar el id de Firestore
  title: string;
  company: string;
  location: string;
  type: string;
  schedule: string;
  appliedDate: string;
  status: ColumnType;
  salary?: string;
  url: string;
  toolsUsed: string[]; // <-- Agregado para almacenar las herramientas utilizadas
  description?: string; // <-- Agregado para la descripción del puesto
  requirements?: string; // <-- Agregado para los requisitos del puesto
}

// Datos de las columnas
const columns = [
  {
    id: "guardados" as ColumnType,
    title: "Guardados",
    count: 0,
    borderColor: "border-blue-500",
    headerColor: "bg-blue-500",
  },
  {
    id: "postulados" as ColumnType,
    title: "Postulados",
    count: 0,
    borderColor: "border-purple-500",
    headerColor: "bg-purple-500",
  },
  {
    id: "entrevistas" as ColumnType,
    title: "Entrevistas",
    count: 0,
    borderColor: "border-orange-500",
    headerColor: "bg-orange-500",
  },
  {
    id: "rechazados" as ColumnType,
    title: "Rechazados",
    count: 0,
    borderColor: "border-red-500",
    headerColor: "bg-red-500",
  },
  {
    id: "aceptados" as ColumnType,
    title: "Aceptados",
    count: 0,
    borderColor: "border-green-500",
    headerColor: "bg-green-500",
  },
];

function JobApplicationCard({
  job,
  onDragStart,
  onDelete,
  borderColor,
}: {
  job: JobApplication;
  onDragStart: (job: JobApplication) => void;
  onDelete: (jobId: number) => void;
  borderColor: string;
}) {
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();

  // Usar directamente el array de herramientas utilizadas desde Firestore
  const toolsUsed: string[] = job.toolsUsed || [];

  // Función para formatear la fecha de agregado
  const formatFechaAgregado = (dateString: string) => {
    try {
      // Si es una fecha en formato de timestamp o string ISO
      const date = new Date(dateString);
      
      // Verificar si es una fecha válida
      if (isNaN(date.getTime())) {
        // Si appliedDate viene en formato DD/MM/YYYY, convertir
        const parts = dateString.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          const formattedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          return formattedDate.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        }
        return dateString; // Devolver como está si no se puede parsear
      }
      
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return dateString;
    }
  };

  // Iconos y estilos para cada herramienta
  const getToolIcon = (tool: string) => {
    switch (tool) {
      case 'analizar-cv':
        return { icon: Bot, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Análisis CV' };
      case 'interview-simulation':
        return { icon: Mic, color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Simulación Entrevista' };
      case 'crear-cv':
        return { icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Crear CV' };
      // case 'match-cv':
      //   return { icon: Target, color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'Match CV' };
      case 'practica-entrevistas':
        return { icon: Mic, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Práctica Entrevistas' };
      default:
        return { icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-100', label: tool };
    }
  };

  const handleViewPostulacion = () => {
    if (job.firestoreId) {
      router.push(`/postulaciones/${job.firestoreId}`);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          draggable
          onDragStart={() => onDragStart(job)}
          className={`bg-white min-w-[340px] rounded-xl border-2 ${borderColor} p-4 hover:shadow-md transition-all cursor-move`}
        >
          <div className="flex items-center gap-2 mb-2">
            {/* Iconos de herramientas utilizadas */}
            {toolsUsed.length > 0 &&
              toolsUsed.map((tool, idx) => {
                const { icon: Icon, color, bgColor, label } = getToolIcon(tool);
                return (
                  <div
                    key={tool + idx}
                    className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center shadow group`}
                    title={label}
                  >
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                );
              })}
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0" />
            <div>
              <span className="text-gray-500 text-sm">Fecha agregado {formatFechaAgregado(job.appliedDate)}</span>
              <h3 className="font-bold text-gray-900 text-lg leading-tight">
                {job.title}
              </h3>
              <p className="text-gray-600 text-base">{job.company}</p>
            </div>
          </div>
          <hr className="my-2 border-blue-50" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-700 text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{job.schedule}</span>
            </div>
            <div className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              <span>{job.type}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>{job.salary ?? "No disponible"}</span>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={handleViewPostulacion}
        >
          Ver postulación
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => setShowDialog(true)}
          className="text-red-600"
        >
          Eliminar
        </ContextMenuItem>
      </ContextMenuContent>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar postulación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. ¿Seguro que deseas eliminar esta
              postulación?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                onDelete(job.id);
                setShowDialog(false);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ContextMenu>
  );
}

// Componente Skeleton para las job cards
function JobApplicationCardSkeleton({ borderColor }: { borderColor: string }) {
  return (
    <div
      className={`bg-white min-w-[340px] rounded-xl border-2 ${borderColor} p-4 animate-pulse`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-gray-300 rounded-md flex-shrink-0" />
        <div>
          <div className="h-5 bg-gray-300 rounded w-32 mb-1"></div>
          <div className="h-4 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
      <hr className="my-2 border-blue-50" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <div className="h-3 bg-gray-300 rounded w-16"></div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <div className="h-3 bg-gray-300 rounded w-20"></div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <div className="h-3 bg-gray-300 rounded w-14"></div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <div className="h-3 bg-gray-300 rounded w-18"></div>
        </div>
      </div>
    </div>
  );
}

export default function PostulacionesPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [draggedJob, setDraggedJob] = useState<JobApplication | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [estado, setEstado] = useState("");
  const [tipoTrabajo, setTipoTrabajo] = useState("");
  const [jornada, setJornada] = useState("");

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Función para contar filtros activos
  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (dateRange.from || dateRange.to) count++;
    if (estado) count++;
    if (tipoTrabajo) count++;
    if (jornada) count++;
    return count;
  };

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setSearchQuery("");
    setDateRange({ from: undefined, to: undefined });
    setEstado("");
    setTipoTrabajo("");
    setJornada("");
  };

  // Obtener opciones únicas para los filtros dinámicamente
  const getUniqueTypes = () => {
    const types = [...new Set(applications.map(app => app.type).filter(Boolean))];
    return types;
  };

  const getUniqueSchedules = () => {
    const schedules = [...new Set(applications.map(app => app.schedule).filter(Boolean))];
    return schedules;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Usuario autenticado:", user);
        setUser(user);
      } else {
        console.log("No hay usuario autenticado");
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;

      setIsLoading(true);
      
      // Obtener las aplicaciones de la base de datos
      const q = query(
        collection(db, "mispostulaciones"),
        where("email", "==", user.email)
      );
      
      const querySnapshot = await getDocs(q);
      const applicationsData: JobApplication[] = querySnapshot.docs.map(
        (doc) => {
          const data = doc.data();
          return {
            id: data.id || Math.random(),
            firestoreId: doc.id, // <-- Guardar el id real de Firestore
            title: data.title || "Sin título",
            company: data.company || "Sin empresa",
            location: data.location || "Sin ubicación",
            type: data.type || "Sin especificar",
            schedule: data.schedule || "Sin horario",
            appliedDate: data.appliedDate || new Date().toLocaleDateString(),
            status: data.status || "guardados",
            salary: data.salary || "No disponible",
            url: data.url || "",
            toolsUsed: data.toolsUsed ?? [], // <-- leer el array de herramientas usadas
          } as JobApplication;
        }
      );

      console.log("Aplicaciones filtradas por email:", applicationsData);

      // Ahora obtenemos las prácticas y asignamos la información a las aplicaciones que coinciden por título
      const practicasCollection = collection(db2, "practicas");
      const querySnapshotPracticas = await getDocs(practicasCollection);
      
      if (!querySnapshotPracticas.empty) {
        const practicasList = querySnapshotPracticas.docs.map((doc) => doc.data());
        console.log("Datos obtenidos de 'practicas2':", practicasList);

        // Aquí almacenamos una copia de las aplicaciones para evitar agregar datos duplicados
        const updatedApplications = applicationsData.map((application) => {
          // Buscar si ya existe una práctica que coincida con el título
          const matchedPractica = practicasList.find(
            (practica) => practica.title === application.title
          );

          // Si encontramos una práctica que coincida, agregarle la información de la práctica
          if (matchedPractica) {
            return {
              ...application, // Mantener todos los datos de la aplicación original
              company: matchedPractica.company || application.company,
              location: matchedPractica.location || application.location,
              salary: matchedPractica.salary || application.salary,
              type: matchedPractica.type || application.type,
              schedule: matchedPractica.schedule || application.schedule,
              description: matchedPractica.description,
              url: matchedPractica.url || application.url,
            };
          }

          return application; // Si no hay coincidencia, mantenemos la aplicación tal cual
        });

        // Eliminar las aplicaciones duplicadas basándonos en el título
        const uniqueApplications = updatedApplications.filter((value, index, self) => {
          return index === self.findIndex((t) => t.title === value.title); // Compara por título para eliminar duplicados
        });

        // Mostrar en consola las aplicaciones con los nuevos campos añadidos y sin duplicados
        console.log("Aplicaciones con la información de prácticas añadida sin duplicados:", uniqueApplications);

        // Actualizamos el estado con las aplicaciones enriquecidas
        setApplications(uniqueApplications);
      } else {
        setApplications(applicationsData);
      }
      
      setIsLoading(false);
    };

    fetchApplications();
  }, [user]);



  const handleDragStart = useCallback((job: JobApplication) => {
    setDraggedJob(job);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

const handleDrop = useCallback(
  (e: React.DragEvent, newStatus: ColumnType) => {
    e.preventDefault();
    
    if (draggedJob) {
      // Actualizar el estado localmente con el nuevo status
      setApplications((prev) =>
        prev.map((app) =>
          app.id === draggedJob.id ? { ...app, status: newStatus } : app
        )
      );

      // Ahora actualizamos el status en Firestore
      if (draggedJob.firestoreId) {
        const jobRef = doc(db, "mispostulaciones", draggedJob.firestoreId);
        
        updateDoc(jobRef, { status: newStatus })
          .then(() => {
            console.log(`Postulación movida a la columna ${newStatus}`);
          })
          .catch((error) => {
            console.error("Error al actualizar el status de la postulación en Firestore:", error);
          });
      }

      // Limpiar el estado de la postulación que estamos arrastrando
      setDraggedJob(null);
    }
  },
  [draggedJob]
);



  // Función para filtrar aplicaciones
  const getFilteredApplications = () => {
    let filtered = applications;

    // Filtro por búsqueda de texto
    if (searchQuery) {
      filtered = filtered.filter(app => 
        app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por rango de fechas
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(app => {
        const appDate = new Date(app.appliedDate);
        
        // Si la fecha del app no es válida, intentar parsear formato DD/MM/YYYY
        if (isNaN(appDate.getTime())) {
          const parts = app.appliedDate.split('/');
          if (parts.length === 3) {
            const [day, month, year] = parts;
            const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            if (!isNaN(parsedDate.getTime())) {
              return (!dateRange.from || parsedDate >= dateRange.from) &&
                     (!dateRange.to || parsedDate <= dateRange.to);
            }
          }
          return false;
        }
        
        return (!dateRange.from || appDate >= dateRange.from) &&
               (!dateRange.to || appDate <= dateRange.to);
      });
    }

    // Filtro por estado (solo si se selecciona uno específico)
    if (estado) {
      filtered = filtered.filter(app => app.status === estado);
    }

    // Filtro por tipo de trabajo
    if (tipoTrabajo) {
      filtered = filtered.filter(app => app.type === tipoTrabajo);
    }

    // Filtro por jornada
    if (jornada) {
      filtered = filtered.filter(app => app.schedule === jornada);
    }

    return filtered;
  };

  const getApplicationsByStatus = (status: ColumnType) => {
    const filteredApps = getFilteredApplications();
    // Si no hay filtro de estado aplicado, mostrar todos de ese status
    // Si hay filtro de estado, solo mostrar si coincide con el status de la columna
    if (estado && estado !== status) {
      return [];
    }
    return filteredApps.filter((app) => app.status === status);
  };

  const handleDeleteJob = async (jobId: number) => {
    // Buscar la aplicación por id
    const jobToDelete = applications.find(job => job.id === jobId);
    if (!jobToDelete?.firestoreId) return;

    setApplications((prev) => prev.filter((job) => job.id !== jobId));

    try {
      await deleteDoc(doc(db, "mispostulaciones", jobToDelete.firestoreId));
    } catch (error) {
      console.error("Error eliminando la postulación:", error);
    }
  };

  const filterOptions = ["Estado", "Tipo trabajo", "Experiencia", "Jornada"];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Mis postulaciones
              </h1>
              {!isLoading && (
                <p className="text-gray-600">
                  {getActiveFiltersCount() > 0 
                    ? `Mostrando ${getFilteredApplications().length} de ${applications.length} postulaciones`
                    : `${applications.length} postulaciones en total`
                  }
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          {/* Barra de búsqueda */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar en mis postulaciones"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-white border border-none rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-myworkin-500 focus:border-transparent transition-all duration-200 shadow-sm"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Filtros de fecha */}
          <div className="flex gap-2">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder="Selecciona rango de fechas"
              className="min-w-[220px] border border-myworkin-blue"
            />
            <div className="relative">
              <Popover
                open={showFilterDropdown}
                onOpenChange={setShowFilterDropdown}
              >
                <PopoverTrigger asChild>
                  <Button variant="default" className="flex items-center gap-2 relative">
                    <Filter className="h-4 w-4" />
                    Filtrar
                    {getActiveFiltersCount() > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {getActiveFiltersCount()}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[340px] p-4" align="end">
                  <div className="space-y-4">
                    {/* Estado */}
                    <div>
                      <Label
                        htmlFor="estado"
                        className="text-gray-700 mb-1 block"
                      >
                        Estado
                      </Label>
                      <Select value={estado} onValueChange={setEstado}>
                        <SelectTrigger
                          id="estado"
                          className="w-full h-12 rounded-xl border-gray-300 text-base"
                        >
                          <SelectValue placeholder="Selecciona estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="guardados">Guardados</SelectItem>
                          <SelectItem value="postulados">Postulados</SelectItem>
                          <SelectItem value="entrevistas">
                            Entrevistas
                          </SelectItem>
                          <SelectItem value="rechazados">Rechazados</SelectItem>
                          <SelectItem value="aceptados">Aceptados</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Tipo trabajo */}
                    <div>
                      <Label
                        htmlFor="tipo-trabajo"
                        className="text-gray-700 mb-1 block"
                      >
                        Tipo trabajo
                      </Label>
                      <Select
                        value={tipoTrabajo}
                        onValueChange={setTipoTrabajo}
                      >
                        <SelectTrigger
                          id="tipo-trabajo"
                          className="w-full h-12 rounded-xl border-gray-300 text-base"
                        >
                          <SelectValue placeholder="Selecciona tipo trabajo" />
                        </SelectTrigger>
                        <SelectContent>
                          {getUniqueTypes().map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Jornada */}
                    <div>
                      <Label
                        htmlFor="jornada"
                        className="text-gray-700 mb-1 block"
                      >
                        Jornada
                      </Label>
                      <Select value={jornada} onValueChange={setJornada}>
                        <SelectTrigger
                          id="jornada"
                          className="w-full h-12 rounded-xl border-gray-300 text-base"
                        >
                          <SelectValue placeholder="Selecciona jornada" />
                        </SelectTrigger>
                        <SelectContent>
                          {getUniqueSchedules().map((schedule) => (
                            <SelectItem key={schedule} value={schedule}>
                              {schedule}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Botones */}
                    <div className="flex justify-between pt-2">
                      <Button
                        variant="outline"
                        className="border-2 border-myworkin-500 text-myworkin-500 font-bold rounded-xl px-6"
                        onClick={() => {
                          setEstado("");
                          setTipoTrabajo("");
                          setJornada("");
                          setShowFilterDropdown(false);
                        }}
                      >
                        Limpiar
                      </Button>
                      <Button
                        className="bg-myworkin-500 hover:bg-myworkin-600 font-bold rounded-xl px-6"
                        onClick={() => {
                          setShowFilterDropdown(false);
                        }}
                      >
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            {getActiveFiltersCount() > 0 && (
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-50"
              >
                Limpiar todo
              </Button>
            )}
          </div>
        </div>

        {/* Kanban Board */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1200px]">
            {columns.map((column) => (
              <div
                key={column.id}
                className="bg-gray-50 rounded-lg min-w-[370px] max-w-[370px] flex-shrink-0"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div
                  className={`rounded-t-lg px-4 py-3 mb-4 flex items-center justify-between ${column.headerColor}`}
                >
                  <h3 className="font-medium text-white">{column.title}</h3>
                  <span className="bg-white text-base font-bold px-3 py-1 rounded-full">
                    {isLoading ? "..." : getApplicationsByStatus(column.id).length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-3 m-4">
                  {isLoading ? (
                    // Mostrar skeleton mientras carga
                    Array.from({ length: 3 }).map((_, index) => (
                      <JobApplicationCardSkeleton
                        key={index}
                        borderColor={column.borderColor}
                      />
                    ))
                  ) : getApplicationsByStatus(column.id).length === 0 ? (
                    // Mostrar mensaje cuando no hay aplicaciones en esta columna
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No hay postulaciones aquí</p>
                      {getActiveFiltersCount() > 0 && (
                        <p className="text-xs mt-1">Intenta ajustar los filtros</p>
                      )}
                    </div>
                  ) : (
                    // Mostrar las cards reales cuando ya cargaron
                    getApplicationsByStatus(column.id).map((job, index) => (
                      <JobApplicationCard
                        key={job.id || index} // Usamos `job.id` si existe, si no usamos `index`
                        job={job}
                        onDragStart={handleDragStart}
                        onDelete={handleDeleteJob}
                        borderColor={column.borderColor}
                      />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}