import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, HelpCircle, MessageSquare, ArrowRight, Target, Users, Award, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
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
    color: 'from-[hsl(213,80%,35%)] to-[hsl(213,100%,20%)]',
  },
  {
    id: 'SIEP',
    title: 'SIEP',
    subtitle: 'Sistema Estadual de Produtividade',
    desc: 'Registro de metas, monitoramento de indicadores e apuração de produtividade.',
    icon: BarChart3,
    modules: 4,
    route: '/aprendizagem',
    color: 'from-[hsl(199,89%,48%)] to-[hsl(213,80%,35%)]',
  },
  {
    id: 'BT',
    title: 'Banco de Talentos',
    subtitle: 'Plataforma de Competências',
    desc: 'Cadastro de competências, histórico profissional e oportunidades internas.',
    icon: Users,
    modules: 4,
    route: '/aprendizagem',
    color: 'from-[hsl(43,96%,56%)] to-[hsl(35,90%,48%)]',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [equipe, setEquipe] = useState<Membro[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: b }, { data: e }] = await Promise.all([
        supabase.from('banners').select('*').eq('ativo', true).order('ordem'),
        supabase.from('equipe').select('*').eq('ativo', true).order('ordem'),
      ]);
      setBanners((b as Banner[]) || []);
      setEquipe((e as Membro[]) || []);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-50 bg-[hsl(213,100%,14%)]/95 backdrop-blur-xl border-b border-white/5 px-6 py-3 flex items-center gap-4" role="banner">
        <img src="/images/logo-seplag.png" alt="SEPLAG" className="h-7 w-auto opacity-90" />
        <div className="h-5 w-px bg-white/20" />
        <div>
          <h1 className="text-sm font-semibold text-white/95 leading-tight tracking-tight">Central de Atendimento às Setoriais</h1>
          <p className="text-[10px] text-white/50 font-medium">SEPLAG – Governo de Mato Grosso</p>
        </div>
        <div className="ml-auto flex gap-1">
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 text-xs rounded-full px-4" onClick={() => navigate('/faq')}>
            <HelpCircle className="h-3.5 w-3.5 mr-1.5" /> FAQ
          </Button>
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 text-xs rounded-full px-4" onClick={() => navigate('/admin')}>
            <BarChart3 className="h-3.5 w-3.5 mr-1.5" /> Admin
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
              className="w-full aspect-[21/7] md:aspect-[21/6] max-h-[420px] home-banner-swiper"
            >
              {banners.map((banner) => (
                <SwiperSlide key={banner.id}>
                  <div
                    className="relative w-full h-full cursor-pointer group"
                    onClick={() => banner.link && window.open(banner.link, '_blank')}
                  >
                    <img src={banner.imagem_url} alt={banner.titulo} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                      <h2 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg tracking-tight">{banner.titulo}</h2>
                      {banner.subtitulo && (
                        <p className="text-sm md:text-lg text-white/80 mt-2 max-w-2xl font-light">{banner.subtitulo}</p>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        ) : (
          /* Hero fallback */
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(213,100%,14%)] via-[hsl(213,80%,22%)] to-[hsl(213,100%,14%)]" />
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            <div className="relative max-w-4xl mx-auto text-center py-24 px-4 space-y-6">
              <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-[1.1]">
                Central de Atendimento<br />
                <span className="text-accent">às Setoriais</span>
              </h2>
              <p className="text-white/60 text-lg md:text-xl max-w-xl mx-auto font-light leading-relaxed">
                Sistema institucional para registro de dúvidas, sugestões e solicitações.
              </p>
              <Button
                size="lg"
                className="mt-2 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-12 py-7 text-base font-semibold shadow-2xl shadow-accent/20 hover:shadow-accent/30 transition-all duration-300 hover:scale-105 active:scale-95"
                onClick={() => navigate('/cadastro')}
              >
                <MessageSquare className="h-5 w-5 mr-2" /> Abrir Chamado
              </Button>
            </div>
          </section>
        )}

        {/* ─── Quick Stats ─── */}
        <div className="border-b border-border/50">
          <div className="max-w-5xl mx-auto grid grid-cols-3 gap-0">
            {[
              { label: 'Registro', value: 'Rápido' },
              { label: 'Resposta', value: '3 dias' },
              { label: 'Dados', value: 'Seguros' },
            ].map((item) => (
              <div key={item.label} className="text-center py-6 border-r last:border-r-0 border-border/50">
                <p className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{item.value}</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── System Cards ─── */}
        <section className="max-w-6xl mx-auto px-4 py-20 space-y-12">
          {/* Logo + Title */}
          <div className="text-center space-y-5">
            <img
              src="/images/logo-seplag-white.png"
              alt="SEPLAG – Secretaria de Estado de Planejamento e Gestão"
              className="mx-auto h-14 sm:h-16 md:h-20 w-auto object-contain brightness-0"
            />
            <p className="text-[11px] font-semibold tracking-[0.2em] text-primary uppercase">
              Central de Atendimento às Setoriais
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.08]">
              Capacitação Digital<br />do Servidor
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
              Aprenda sobre os sistemas estaduais de forma interativa, com quizzes, pontuação e certificado de conclusão.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SISTEMAS.map((sistema) => {
              const Icon = sistema.icon;
              return (
                <Card
                  key={sistema.id}
                  className="rounded-2xl border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer group overflow-hidden bg-card hover:-translate-y-1"
                  onClick={() => navigate(sistema.route)}
                >
                  <CardContent className="p-0">
                    <div className={`bg-gradient-to-br ${sistema.color} p-5 flex items-center gap-3`}>
                      <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-tight">{sistema.title}</h4>
                        <p className="text-[10px] text-white/70 font-medium">{sistema.subtitle}</p>
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
                        <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
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
              className="w-full sm:w-auto text-sm px-10 py-6 rounded-full shadow-lg shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-300 gap-2.5 font-semibold"
              onClick={() => navigate('/cadastro')}
            >
              <MessageSquare className="h-4 w-4" /> Abrir Chamado
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-sm px-10 py-6 rounded-full border-border hover:bg-secondary hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 gap-2.5 font-semibold"
              onClick={() => navigate('/faq')}
            >
              <HelpCircle className="h-4 w-4" /> Acesso ao FAQ
            </Button>
          </div>
        </section>

        {/* ─── Team Section ─── */}
        {equipe.length > 0 && (
          <section className="bg-secondary/50 border-t py-20 px-4">
            <div className="max-w-6xl mx-auto space-y-10">
              <div className="text-center space-y-3">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-primary uppercase">
                  Gestão de Áreas
                </p>
                <h3 className="text-3xl font-bold text-foreground tracking-tight">Nossa Equipe</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto font-light">
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
                        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-border shadow-lg">
                          {m.foto_url ? (
                            <img src={m.foto_url} alt={m.nome} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-secondary flex items-center justify-center">
                              <Users className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{m.nome}</p>
                          <p className="text-xs text-primary font-medium">{m.cargo}</p>
                          <p className="text-[11px] text-muted-foreground">{m.area}</p>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                <button className="team-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-card shadow-md border border-border flex items-center justify-center hover:bg-secondary transition-colors">
                  <ChevronLeft className="h-4 w-4 text-foreground" />
                </button>
                <button className="team-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-card shadow-md border border-border flex items-center justify-center hover:bg-secondary transition-colors">
                  <ChevronRight className="h-4 w-4 text-foreground" />
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card px-6 py-5 text-center" role="contentinfo">
        <p className="text-xs text-muted-foreground">
          Secretaria de Planejamento e Gestão – Governo do Estado de Mato Grosso
        </p>
      </footer>
    </div>
  );
};

export default Home;
