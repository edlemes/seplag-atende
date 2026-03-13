import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, HelpCircle, MessageSquare, ArrowRight, Target, Users, Award, BookOpen, ChevronLeft, ChevronRight, AlertTriangle, Clock, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface Banner {
  id: string;
  titulo: string;
  subtitulo: string;
  imagem_url: string;
  link: string;
  ordem: number;
}

interface Membro {
  id: string;
  nome: string;
  cargo: string;
  area: string;
  foto_url: string;
}

interface Solicitacao {
  id: string;
  protocolo: string;
  nome: string;
  secretaria: string;
  assunto: string;
  status: string;
  prioridade: string;
  sla_limite: string;
  data: string;
}

const SISTEMAS = [
  {
    id: 'atendimento',
    title: 'Central de Atendimento',
    subtitle: 'SEPLAG MT',
    desc: 'Registro de dúvidas, sugestões e solicitações relacionadas aos serviços da SEPLAG.',
    icon: MessageSquare,
    route: '/cadastro',
    color: 'from-primary to-primary/80',
  },
  {
    id: 'SIAD',
    title: 'SIAD',
    subtitle: 'Sistema de Avaliação de Desempenho',
    desc: 'Avaliação de desempenho, fluxo de avaliação e papéis dos participantes.',
    icon: Target,
    modules: 6,
    route: '/aprendizagem',
    color: 'from-[hsl(210,85%,40%)] to-[hsl(210,100%,28%)]',
  },
  {
    id: 'SIEP',
    title: 'SIEP',
    subtitle: 'Sistema Estadual de Produtividade',
    desc: 'Registro de metas, monitoramento de indicadores e apuração de produtividade.',
    icon: BarChart3,
    modules: 4,
    route: '/aprendizagem',
    color: 'from-[hsl(200,70%,50%)] to-[hsl(210,85%,40%)]',
  },
  {
    id: 'BT',
    title: 'Banco de Talentos',
    subtitle: 'Plataforma de Competências',
    desc: 'Cadastro de competências, histórico profissional e oportunidades internas.',
    icon: Users,
    modules: 4,
    route: '/aprendizagem',
    color: 'from-[hsl(45,97%,54%)] to-[hsl(35,90%,50%)]',
  },
];

function getSlaStatus(slaLimite: string) {
  const now = new Date();
  const limite = new Date(slaLimite);
  const diffMs = limite.getTime() - now.getTime();
  const diffH = diffMs / (1000 * 60 * 60);
  if (diffH < 0) return 'vencido';
  if (diffH <= 2) return 'critico';
  if (diffH <= 24) return 'alerta';
  return 'ok';
}

const Home = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [equipe, setEquipe] = useState<Membro[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: b }, { data: e }, { data: s }] = await Promise.all([
        supabase.from('banners').select('*').eq('ativo', true).order('ordem'),
        supabase.from('equipe').select('*').eq('ativo', true).order('ordem'),
        supabase.from('solicitacoes').select('id,protocolo,nome,secretaria,assunto,status,prioridade,sla_limite,data').order('data', { ascending: false }).limit(200),
      ]);
      setBanners((b as Banner[]) || []);
      setEquipe((e as Membro[]) || []);
      setSolicitacoes((s as Solicitacao[]) || []);
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const abertos = solicitacoes.filter(s => s.status === 'Aberto');
    const emAndamento = solicitacoes.filter(s => s.status === 'Em andamento');
    const resolvidos = solicitacoes.filter(s => s.status === 'Resolvido' || s.status === 'Fechado');
    const vencidos = solicitacoes.filter(s => (s.status === 'Aberto' || s.status === 'Em andamento') && getSlaStatus(s.sla_limite) === 'vencido');
    const criticos = solicitacoes.filter(s => (s.status === 'Aberto' || s.status === 'Em andamento') && getSlaStatus(s.sla_limite) === 'critico');
    const alertas = solicitacoes.filter(s => (s.status === 'Aberto' || s.status === 'Em andamento') && getSlaStatus(s.sla_limite) === 'alerta');

    // Lotes por secretaria
    const porSecretaria: Record<string, number> = {};
    abertos.concat(emAndamento).forEach(s => {
      porSecretaria[s.secretaria] = (porSecretaria[s.secretaria] || 0) + 1;
    });
    const lotes = Object.entries(porSecretaria)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return { abertos: abertos.length, emAndamento: emAndamento.length, resolvidos: resolvidos.length, vencidos, criticos, alertas, lotes, total: solicitacoes.length };
  }, [solicitacoes]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="institutional-gradient px-6 py-4 flex items-center gap-3 shadow-lg" role="banner">
        <img src="/images/logo-seplag-alt.jpg" alt="SEPLAG" className="h-8 w-auto rounded" />
        <div>
          <h1 className="text-lg font-bold text-primary-foreground leading-tight">Central de Atendimento às Setoriais</h1>
          <p className="text-xs text-primary-foreground/80">SEPLAG – Mato Grosso</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 text-xs" onClick={() => navigate('/faq')}>
            <HelpCircle className="h-4 w-4 mr-1" /> FAQ
          </Button>
          <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 text-xs" onClick={() => navigate('/admin')}>
            <BarChart3 className="h-4 w-4 mr-1" /> Admin
          </Button>
        </div>
      </header>

      <main className="flex-1" role="main">
        {/* ─── Banner Carousel ─── */}
        {banners.length > 0 ? (
          <section className="relative">
            <Swiper
              modules={[Navigation, Pagination, Autoplay, EffectFade]}
              effect="fade"
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              loop={banners.length > 1}
              className="w-full aspect-[21/7] md:aspect-[21/6] max-h-[400px] home-banner-swiper"
            >
              {banners.map((banner) => (
                <SwiperSlide key={banner.id}>
                  <div
                    className="relative w-full h-full cursor-pointer group"
                    onClick={() => banner.link && window.open(banner.link, '_blank')}
                  >
                    <img src={banner.imagem_url} alt={banner.titulo} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                      <h2 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg">{banner.titulo}</h2>
                      {banner.subtitulo && (
                        <p className="text-sm md:text-lg text-white/90 mt-1 max-w-2xl">{banner.subtitulo}</p>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        ) : (
          <section className="institutional-gradient py-16 px-4">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground tracking-tight">
                Central de Atendimento às Setoriais
              </h2>
              <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
                Sistema institucional para registro de dúvidas, sugestões e solicitações.
              </p>
              <Button
                size="lg"
                className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-10 py-7 text-base font-semibold shadow-lg"
                onClick={() => navigate('/cadastro')}
              >
                <MessageSquare className="h-5 w-5 mr-2" /> Abrir Chamado
              </Button>
            </div>
          </section>
        )}

        {/* ─── Quick Stats ─── */}
        <div className="bg-card border-b">
          <div className="max-w-6xl mx-auto grid grid-cols-3 gap-0">
            {[
              { label: 'Registro', value: 'Rápido' },
              { label: 'Resposta', value: '3 dias' },
              { label: 'Dados', value: 'Seguros' },
            ].map((item) => (
              <div key={item.label} className="text-center py-5 border-r last:border-r-0 border-border/50">
                <p className="text-xl md:text-2xl font-bold text-primary">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── System Cards Grid ─── */}
        <section className="max-w-6xl mx-auto px-4 py-12 space-y-8">
          {/* Logo + Title */}
          <div className="text-center space-y-4">
            <img
              src="/images/logo-seplag-alt.jpg"
              alt="SEPLAG – Secretaria de Estado de Planejamento e Gestão"
              className="mx-auto h-16 sm:h-20 md:h-24 w-auto object-contain"
            />
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              Central de Atendimento às Setoriais
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">Capacitação Digital do Servidor</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Aprenda sobre os sistemas estaduais de forma interativa, com quizzes, pontuação e certificado de conclusão.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SISTEMAS.map((sistema) => {
              const Icon = sistema.icon;
              return (
                <Card
                  key={sistema.id}
                  className="rounded-2xl border-0 shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer group overflow-hidden"
                  onClick={() => navigate(sistema.route)}
                >
                  <CardContent className="p-0">
                    <div className={`bg-gradient-to-br ${sistema.color} p-5 flex items-center gap-3`}>
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">{sistema.title}</h4>
                        <p className="text-[11px] text-white/80">{sistema.subtitle}</p>
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      <p className="text-xs text-muted-foreground leading-relaxed">{sistema.desc}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {sistema.modules && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                              <BookOpen className="h-3 w-3" /> {sistema.modules} módulos
                            </span>
                          )}
                          {sistema.modules && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                              <Award className="h-3 w-3" /> Certificado
                            </span>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="w-full sm:w-auto text-base px-10 py-7 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-500 gap-3 font-medium"
              onClick={() => navigate('/cadastro')}
            >
              <MessageSquare className="h-5 w-5" /> Abrir Chamado
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-base px-10 py-7 rounded-full border-border/60 hover:bg-muted/60 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-500 gap-3 font-medium"
              onClick={() => navigate('/faq')}
            >
              <HelpCircle className="h-5 w-5" /> Acesso ao FAQ
            </Button>
          </div>
        </section>

        {/* ─── Team Section ─── */}
        {equipe.length > 0 && (
          <section className="bg-card border-t py-12 px-4">
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
                  <Users className="h-3.5 w-3.5" />
                  Gestão de Áreas
                </div>
                <h3 className="text-2xl font-bold text-foreground">Nossa Equipe</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Conheça os gestores responsáveis por cada área de atuação.
                </p>
              </div>

              <div className="relative px-10">
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation={{ prevEl: '.team-prev', nextEl: '.team-next' }}
                  pagination={{ clickable: true }}
                  spaceBetween={20}
                  slidesPerView={1}
                  breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }}
                  className="team-swiper pb-10"
                >
                  {equipe.map((m) => (
                    <SwiperSlide key={m.id}>
                      <div className="text-center space-y-3 py-4">
                        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
                          {m.foto_url ? (
                            <img src={m.foto_url} alt={m.nome} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-8 w-8 text-primary/40" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{m.nome}</p>
                          <p className="text-xs text-primary font-medium">{m.cargo}</p>
                          <p className="text-[11px] text-muted-foreground">{m.area}</p>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                <button className="team-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-card shadow-md border border-border flex items-center justify-center hover:bg-muted transition-colors">
                  <ChevronLeft className="h-4 w-4 text-foreground" />
                </button>
                <button className="team-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-card shadow-md border border-border flex items-center justify-center hover:bg-muted transition-colors">
                  <ChevronRight className="h-4 w-4 text-foreground" />
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t bg-card px-6 py-4 text-center text-sm text-muted-foreground" role="contentinfo">
        Secretaria de Planejamento e Gestão – Governo do Estado de Mato Grosso
      </footer>
    </div>
  );
};

export default Home;
