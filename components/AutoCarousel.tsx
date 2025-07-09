'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';

const CARDS = [
	{
		label: 'Simulación de entrevistas',
		labelColor: 'bg-yellow-100 text-yellow-700',
		text: (
			<>
				¿Aún no conoces a Worky?<br />
				Prepárate para destacar y simula una entrevista con nuestro bot potenciado con IA
			</>
		),
	},
	{
		label: 'Análisis de CV con IA',
		labelColor: 'bg-green-100 text-green-700',
		text: (
			<>
				¿Tu CV está alineado con lo que buscan las empresas?<br />
				Analiza tu CV con IA y mejora tu perfil profesional.
			</>
		),
	},
	{
		label: 'Crear CV',
		labelColor: 'bg-blue-100 text-blue-700',
		text: (
			<>
				¿Te gustaría tener un CV impecable sin complicarte?<br />
				Créalo en minutos con formato Harvard y listo para postular.
			</>
		),
	},
];

interface AutoCarouselProps {
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

export default function AutoCarousel({ size = 'md', className = '' }: AutoCarouselProps) {
	const [active, setActive] = useState(0);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		timeoutRef.current && clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => {
			setActive((prev) => (prev + 1) % CARDS.length);
		}, 4000);
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [active]);

	// Configuraciones por tamaño
	const sizeConfig = {
		sm: {
			container: 'text-xs',
			maxWidth: 'max-w-xs',
			padding: 'p-4',
			minHeight: 'min-h-[160px]',
			textSize: 'text-sm',
			labelSize: 'text-xs',
			iconSize: 'h-4 w-4',
			dotSize: 'h-1.5 w-1.5',
			borderRadius: 'rounded-2xl'
		},
		md: {
			container: 'text-sm',
			maxWidth: 'max-w-md',
			padding: 'p-6',
			minHeight: 'min-h-[210px]',
			textSize: 'text-lg',
			labelSize: 'text-xs',
			iconSize: 'h-6 w-6',
			dotSize: 'h-2 w-2',
			borderRadius: 'rounded-3xl'
		},
		lg: {
			container: 'text-base',
			maxWidth: 'max-w-lg',
			padding: 'p-8',
			minHeight: 'min-h-[280px]',
			textSize: 'text-xl',
			labelSize: 'text-sm',
			iconSize: 'h-8 w-8',
			dotSize: 'h-3 w-3',
			borderRadius: 'rounded-3xl'
		}
	};

	const config = sizeConfig[size];

	return (
		<div className={`w-full flex flex-col items-center ${config.container} ${className}`}>
			<div className={`relative w-full ${config.maxWidth}`}>
				{CARDS.map((card, idx) => (
					<div
						key={idx}
						className={`absolute inset-0 transition-opacity duration-700 ${
							idx === active ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
						}`}
					>
						<div className={`bg-[#f6fbff] ${config.borderRadius} shadow-md ${config.padding} ${config.minHeight} flex flex-col justify-between`}>
							<div>
								<span className={`px-3 py-1 rounded-lg ${config.labelSize} font-semibold ${card.labelColor}`}>
									{card.label}
								</span>
								<button className="float-right text-gray-400 hover:text-gray-600">
									<ChevronRight className={config.iconSize} />
								</button>
							</div>
							<div className={`mt-4 mb-2 ${config.textSize} font-semibold text-gray-900 leading-snug`}>
								{card.text}
							</div>
							{/* Paginación */}
							<div className="flex justify-center gap-2 mt-4">
								{CARDS.map((_, i) => (
									<span
										key={i}
										className={`${config.dotSize} rounded-full transition-all ${
											i === active ? 'bg-blue-400' : 'bg-blue-100'
										}`}
									/>
								))}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}