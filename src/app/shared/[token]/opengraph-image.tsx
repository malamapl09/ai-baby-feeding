import { ImageResponse } from 'next/og';
import { APP_NAME } from '@/config/constants';

export const runtime = 'edge';
export const alt = 'Shared Baby Meal Plan';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Fetch plan data for personalized OG image
  let babyName = 'Baby';
  let days = 7;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/share/${token}`, {
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      babyName = data.plan?.babies?.name || 'Baby';
      days = data.plan?.days || 7;
    }
  } catch (error) {
    console.error('Error fetching plan for OG image:', error);
  }

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
        {/* Icons */}
        <div style={{ fontSize: 60, marginBottom: 20, display: 'flex', gap: 10 }}>
          <span>📋</span>
          <span>🍼</span>
        </div>

        {/* Baby Name's Meal Plan */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 'bold',
            color: '#E11D48',
            marginBottom: 10,
            textAlign: 'center',
          }}
        >
          {`${babyName}'s Meal Plan`}
        </div>

        {/* Days */}
        <div
          style={{
            fontSize: 32,
            color: '#374151',
            marginBottom: 30,
          }}
        >
          {days}-Day Personalized Plan
        </div>

        {/* Powered by */}
        <div
          style={{
            fontSize: 24,
            color: '#6B7280',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>Powered by</span>
          <span style={{ fontWeight: 'bold', color: '#E11D48' }}>{APP_NAME}</span>
        </div>

        {/* Decorative food emojis */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            gap: 20,
            fontSize: 36,
          }}
        >
          <span>🥣</span>
          <span>🍎</span>
          <span>🥦</span>
          <span>🥕</span>
          <span>🍌</span>
          <span>🥑</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
