import { ImageResponse } from 'next/og';
import { APP_NAME } from '@/config/constants';

export const runtime = 'edge';
export const alt = 'Peapod Meals - AI Baby Meal Planner';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const isSpanish = locale === 'es';
  const tagline = isSpanish
    ? 'Planificador de Comidas para Bebés con IA'
    : 'AI Baby Meal Planner';
  const description = isSpanish
    ? 'Planes de comidas personalizados para tu bebé'
    : 'Personalized meal plans for your baby';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFF1F2',
          backgroundImage: 'linear-gradient(135deg, #FFF1F2 0%, #FFFBEB 100%)',
        }}
      >
        {/* Logo Emoji */}
        <div style={{ fontSize: 80, marginBottom: 20 }}>🍼</div>

        {/* App Name */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: '#E11D48',
            marginBottom: 10,
          }}
        >
          {APP_NAME}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 36,
            color: '#374151',
            marginBottom: 20,
          }}
        >
          {tagline}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 24,
            color: '#6B7280',
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          {description}
        </div>

        {/* Decorative food emojis */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            gap: 20,
            fontSize: 40,
          }}
        >
          <span>👶</span>
          <span>🍎</span>
          <span>🥦</span>
          <span>🥕</span>
          <span>🍌</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
