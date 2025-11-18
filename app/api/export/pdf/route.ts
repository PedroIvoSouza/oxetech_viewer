import { NextResponse } from 'next/server'
import { chromium } from 'playwright'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { url, filename } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL é obrigatória' },
        { status: 400 }
      )
    }

    // Iniciar navegador
    const browser = await chromium.launch({
      headless: true,
    })

    const page = await browser.newPage()

    // Navegar para a URL
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    // Aguardar carregamento completo
    await page.waitForTimeout(2000)

    // Gerar PDF
    const pdf = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    })

    await browser.close()

    // Retornar PDF (converter Buffer para Uint8Array)
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename || 'dashboard'}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar PDF' },
      { status: 500 }
    )
  }
}

