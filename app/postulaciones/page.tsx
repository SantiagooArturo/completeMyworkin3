"use client";

import { useState, useCallback, useEffect } from "react";
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
import { collection, getDocs, query, where } from "firebase/firestore";
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

interface JobApplication {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  schedule: string;
  appliedDate: string;
  status: ColumnType;
  salary?: string;
  url: string;
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

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          draggable
          onDragStart={() => onDragStart(job)}
          className={`bg-white min-w-[340px] rounded-xl border-2 ${borderColor} p-4 hover:shadow-md transition-all cursor-move`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0" />
            <div>
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

export default function PostulacionesPage() {
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

      const q = query(
        collection(db, "mispostulaciones"),
        where("email", "==", user.email)
      );

      const querySnapshot = await getDocs(q);
      const applicationsData: JobApplication[] = querySnapshot.docs.map(
        (doc) => doc.data() as JobApplication
      );

      console.log("Aplicaciones filtradas por email:", applicationsData);

      setApplications(applicationsData);
    };

    fetchApplications();
  }, [user]);


  const [practicasData, setPracticasData] = useState<any[]>([]);


useEffect(() => {
  const fetchApplications = async () => {
    if (!user) return;

    // Obtener las aplicaciones de la base de datos
    const q = query(
      collection(db, "mispostulaciones"),
      where("email", "==", user.email)
    );
    
    const querySnapshot = await getDocs(q);
    const applicationsData: JobApplication[] = querySnapshot.docs.map(
      (doc) => doc.data() as JobApplication
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
            company: matchedPractica.company,
            location: matchedPractica.location,
            salary: matchedPractica.salary,
            description: matchedPractica.description,
            url: matchedPractica.url,
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
    }
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
        setApplications((prev) =>
          prev.map((app) =>
            app.id === draggedJob.id ? { ...app, status: newStatus } : app
          )
        );
        setDraggedJob(null);
      }
    },
    [draggedJob]
  );

  const getApplicationsByStatus = (status: ColumnType) => {
    return applications.filter((app) => app.status === status);
  };

  const handleDeleteJob = (jobId: number) => {
    setApplications((prev) => prev.filter((job) => job.id !== jobId));
  };

  const filterOptions = ["Estado", "Tipo trabajo", "Experiencia", "Jornada"];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Mis postulaciones
          </h1>
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
                  <Button variant="default" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filtrar
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
                          <SelectItem value="remoto">Remoto</SelectItem>
                          <SelectItem value="hibrido">Híbrido</SelectItem>
                          <SelectItem value="presencial">Presencial</SelectItem>
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
                          <SelectItem value="tiempo-completo">
                            Tiempo completo
                          </SelectItem>
                          <SelectItem value="medio-tiempo">
                            Medio tiempo
                          </SelectItem>
                          <SelectItem value="practicas">Prácticas</SelectItem>
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
                        onClick={() => setShowFilterDropdown(false)}
                      >
                        Filtrar
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
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
                    {getApplicationsByStatus(column.id).length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-3 m-4">
                  {getApplicationsByStatus(column.id).map((job, index) => (
                    <JobApplicationCard
                      key={job.id || index} // Usamos `job.id` si existe, si no usamos `index`
                      job={job}
                      onDragStart={handleDragStart}
                      onDelete={handleDeleteJob}
                      borderColor={column.borderColor}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
