import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Clock, Download, Eye, Loader2, Lock, PlayCircle, Star, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import usePaymentStore from '../store/usePaymentStore';
import { progressApi, projectsExpressApi } from '../api/express';
import { normalizeProject } from '../utils/normalizeProject';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setCheckoutModalOpen, orders } = usePaymentStore();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [startingTrial, setStartingTrial] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await projectsExpressApi.getById(id);
        setProject(normalizeProject(data.project || data));
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  useEffect(() => {
    if (!project) return;
    const images = project.screenshots?.length > 0 ? project.screenshots : (project.thumbnail?.secure_url ? [project.thumbnail.secure_url] : []);
    if (images.length > 1) {
      const interval = setInterval(() => setCurrentImageIdx((prev) => (prev + 1) % images.length), 4200);
      return () => clearInterval(interval);
    }
  }, [project]);

  const isUnlocked = useMemo(() => {
    if (!project) return false;
    const sellerId = project.seller?._id || project.seller?.id || project.seller;
    const userId = user?._id || user?.id;
    const canManage = user?.role === 'admin' || (sellerId && userId && sellerId.toString() === userId.toString());
    if (canManage) return true;
    if (!project.price || Number(project.price) === 0) return true;
    return orders.some((order) => order.project?._id === id || order.project?.id === id)
      || user?.purchasedProjects?.some((projectId) => projectId?.toString() === id);
  }, [orders, id, project, user]);

  const canManageCourse = useMemo(() => {
    if (!project || !user) return false;
    const sellerId = project.seller?._id || project.seller?.id || project.seller;
    const userId = user._id || user.id;
    return user.role === 'admin' || (sellerId && userId && sellerId.toString() === userId.toString());
  }, [project, user]);

  const projectImages = project?.screenshots?.length > 0
    ? project.screenshots
    : (project?.thumbnail?.secure_url ? [project.thumbnail.secure_url] : []);

  const priceLabel = !project || Number(project.price) === 0 ? 'Free' : `Rs ${project.price}`;
  const reviewCount = project?.reviewCount ?? project?.reviews?.length ?? 0;
  const ratingLabel = reviewCount > 0 && Number(project.rating) > 0 ? Number(project.rating).toFixed(1) : 'New';

  useEffect(() => {
    if (!project || !user) return;
    const existingReview = project.reviews?.find((review) => {
      const reviewUserId = review.user?._id || review.user?.id || review.user;
      return reviewUserId?.toString() === (user._id || user.id)?.toString();
    });
    if (existingReview) {
      setRatingValue(existingReview.rating || 0);
      setRatingComment(existingReview.comment || '');
    }
  }, [project, user]);

  const handleStartFree = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      setStartingTrial(true);
      await progressApi.startTrial(project._id || id);
      navigate(`/lab/${project._id || id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start the free milestone.');
    } finally {
      setStartingTrial(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await projectsExpressApi.download(project._id || id);
      if (response) {
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${project.title ? project.title.replace(/\s+/g, '-') : 'project'}-source.zip`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success('Download started');
      }
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Error downloading project files. Ensure you have purchased it.');
    } finally {
      setDownloading(false);
    }
  };

  const handleRateProject = async (event) => {
    event.preventDefault();
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!ratingValue) {
      toast.error('Choose a rating first.');
      return;
    }

    try {
      setSubmittingRating(true);
      const response = await projectsExpressApi.rateProject(project._id || id, {
        rating: ratingValue,
        comment: ratingComment,
      });
      setProject(normalizeProject(response.project));
      toast.success('Rating saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save rating.');
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#F6F4EF] dark:bg-[#10130F]">
        <Loader2 className="animate-spin text-[#1E3A2F] dark:text-[#9DE6B8]" size={40} />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-[70vh] bg-[#F6F4EF] px-8 py-14 text-center">
        <h1 className="font-headline text-3xl font-semibold text-[#C0392B]">Build course not found</h1>
        <p className="mt-3 text-[#5C5851]">{error || "The course you're looking for does not exist."}</p>
        <button onClick={() => navigate('/catalog')} className="mt-6 rounded-lg bg-[#1E3A2F] px-6 py-3 font-bold text-white">
          Browse catalog
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F4EF] pb-14 text-[#1C1A17] dark:bg-[#10130F] dark:text-[#F7F2E8]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-8">
        <button onClick={() => navigate('/catalog')} className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#5C5851] hover:text-[#1E3A2F] dark:text-[#B8C2B1] dark:hover:text-[#DDEBDD]">
          <ChevronLeft size={17} /> Back to builds
        </button>

        <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-[#E2DDD4] bg-white dark:border-white/10 dark:bg-[#171B16]">
              <div className="group relative aspect-video w-full overflow-hidden bg-[#F0EDE6] dark:bg-[#10130F]">
                {projectImages.length > 0 ? (
                  <img 
                    src={projectImages[currentImageIdx]} 
                    alt={project.title} 
                    crossOrigin="anonymous" 
                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105" 
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#F6F4EF,#E8F2EC)] dark:bg-[linear-gradient(135deg,#171B16,#10130F)]">
                    <BookOpen className="text-[#1E3A2F]/30 dark:text-[#9DE6B8]/20" size={72} strokeWidth={1.5} />
                  </div>
                )}

                {projectImages.length > 1 && (
                  <>
                    <button onClick={() => setCurrentImageIdx((prev) => (prev - 1 + projectImages.length) % projectImages.length)} className="absolute left-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1C1A17] shadow">
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={() => setCurrentImageIdx((prev) => (prev + 1) % projectImages.length)} className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1C1A17] shadow">
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#E2DDD4] bg-white p-5 md:p-6 dark:border-white/10 dark:bg-[#171B16]">
              <p className="text-sm font-bold uppercase tracking-widest text-[#D4840A]">What you will build</p>
              <h1 className="mt-2 font-headline text-3xl font-semibold tracking-tight md:text-4xl">{project.title}</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[#5C5851] dark:text-[#D9D2C7]">{project.description || project.summary}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {(project.techStack || []).map((tech) => (
                  <span key={tech} className="rounded-full border border-[#E2DDD4] bg-[#F0EDE6] px-3 py-1.5 font-mono text-xs font-medium text-[#5C5851] dark:border-white/10 dark:bg-[#10130F] dark:text-[#B8C2B1]">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-[#E2DDD4] pt-5 dark:border-white/10">
                <div className="flex items-center gap-2 text-[#5C5851] dark:text-[#B8C2B1]">
                  <Eye className="text-[#1E3A2F] dark:text-[#9DE6B8]" size={18} />
                  <span className="text-sm font-bold">{project.views || 0} Views</span>
                </div>
                <div className="flex items-center gap-2 text-[#5C5851] dark:text-[#B8C2B1]">
                  <Users className="text-[#1E3A2F] dark:text-[#9DE6B8]" size={18} />
                  <span className="text-sm font-bold">{project.purchases || 0} Learners</span>
                </div>
                <div className="flex items-center gap-2 text-[#5C5851] dark:text-[#B8C2B1]">
                  <Clock className="text-[#1E3A2F] dark:text-[#9DE6B8]" size={18} />
                  <span className="text-sm font-bold">4-8 hrs Pace</span>
                </div>
                <div className="flex items-center gap-2 text-[#5C5851] dark:text-[#B8C2B1]">
                  <BookOpen className="text-[#1E3A2F] dark:text-[#9DE6B8]" size={18} />
                  <span className="text-sm font-bold">{project.milestones?.length || 0} Milestones</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E2DDD4] bg-white p-5 md:p-6 dark:border-white/10 dark:bg-[#171B16]">
              <p className="text-sm font-bold uppercase tracking-widest text-[#D4840A]">Milestone roadmap</p>
              <h2 className="mt-2 font-headline text-2xl font-semibold">A course built from the project journey.</h2>
              <div className="mt-5 space-y-3">
                {(project.milestones || []).map((milestone, idx) => (
                  <div key={milestone.id || idx} className={`relative rounded-xl border p-4 ${idx === 0 ? 'border-[#1E3A2F] bg-[#E8F2EC] dark:border-[#7FC79C] dark:bg-[#223426]' : 'border-[#E2DDD4] bg-[#F6F4EF] dark:border-white/10 dark:bg-[#10130F]'}`}>
                    <div className="flex gap-4">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${idx === 0 ? 'bg-[#1E3A2F] text-white' : 'bg-white text-[#5C5851]'}`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-headline text-xl font-semibold">{milestone.title || milestone.name}</h3>
                          {idx === 0 && <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#1E3A2F]">Free preview</span>}
                          {idx > 0 && !isUnlocked && <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#5C5851]"><Lock size={12} /> Locked</span>}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[#5C5851] dark:text-[#D9D2C7]">{milestone.description}</p>
                        {milestone.steps?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {milestone.steps.slice(0, 3).map((step, stepIdx) => (
                              <span key={step.id || stepIdx} className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#5C5851]">
                                {step.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start space-y-5">
            {/* Creator and Rating Box */}
            <div className="rounded-2xl border border-[#E2DDD4] bg-white p-5 shadow-[0_8px_30px_rgba(28,26,23,0.04)] dark:border-white/10 dark:bg-[#171B16]">
              {project.seller && (
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E8F2EC] font-bold text-[#1E3A2F] text-lg dark:bg-[#223426] dark:text-[#9DE6B8]">
                    {project.seller.name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#5C5851] dark:text-[#8F9A8A]">Creator</p>
                    <Link to={`/seller/${project.seller._id}/profile`} className="font-headline text-lg font-semibold text-[#1C1A17] hover:text-[#1E3A2F] dark:text-[#F7F2E8] dark:hover:text-[#9DE6B8]">
                      {project.seller.name}
                    </Link>
                  </div>
                </div>
              )}
              
              <div className="mt-5 flex items-center justify-between rounded-xl bg-[#F6F4EF] p-4 dark:bg-[#10130F]">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#5C5851] dark:text-[#8F9A8A]">Course Rating</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Star className="text-[#D4840A] fill-current dark:text-[#F0C565]" size={18} />
                    <span className="font-headline text-xl font-semibold text-[#1C1A17] dark:text-[#F7F2E8]">
                      {reviewCount > 0 ? ratingLabel : 'New'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-[#1C1A17] dark:text-[#F7F2E8]">
                    {reviewCount}
                  </span>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#5C5851] dark:text-[#8F9A8A]">Reviews</p>
                </div>
              </div>
            </div>

            {/* Purchase & Action Box */}
            <div className="rounded-2xl border border-[#E2DDD4] bg-white p-5 shadow-[0_18px_50px_rgba(28,26,23,0.08)] dark:border-white/10 dark:bg-[#171B16]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#5C5851] dark:text-[#8F9A8A]">Unlock this build course</p>
              <div className="mt-2 font-headline text-4xl font-semibold text-[#1E3A2F] dark:text-[#9DE6B8]">{priceLabel}</div>
              
              <div className="mt-6 space-y-3">
                {isUnlocked ? (
                  <>
                    <button onClick={() => window.location.href = `/lab/${id}`} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1E3A2F] px-5 py-3.5 text-sm font-bold text-white hover:bg-[#2D5C42] dark:!bg-[#C8F7D4] dark:!text-[#08140D] dark:hover:!bg-[#DDFBE5]">
                      <PlayCircle size={18} /> Enter Lab
                    </button>
                    <button onClick={handleDownload} disabled={downloading} className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E2DDD4] px-5 py-3.5 text-sm font-bold text-[#1C1A17] hover:bg-[#F6F4EF] disabled:opacity-50 dark:border-white/10 dark:text-[#F7F2E8] dark:hover:bg-[#223426]">
                      {downloading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                      Download source
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleStartFree} disabled={startingTrial} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#D4840A] px-5 py-3.5 text-sm font-bold text-[#1C1A17] shadow-[0_8px_20px_rgba(212,132,10,0.22)] hover:brightness-105 disabled:opacity-60">
                      {startingTrial ? <Loader2 className="animate-spin" size={18} /> : <PlayCircle size={18} />}
                      Start milestone 1 free
                    </button>
                    <button
                      onClick={() => {
                        if (!user) navigate('/auth');
                        else setCheckoutModalOpen(true, project);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1E3A2F] px-5 py-3.5 text-sm font-bold text-white hover:bg-[#2D5C42]"
                    >
                      <Lock size={18} /> Unlock full build
                    </button>
                  </>
                )}

                {canManageCourse && (
                  <button
                    onClick={() => navigate(`/seller/upload?edit=${project._id}`)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#D4840A] bg-[#FEF3DC] px-5 py-3.5 text-sm font-bold text-[#92580A] hover:bg-[#FDE8B5]"
                  >
                    <Download size={18} className="rotate-180" /> Edit course content
                  </button>
                )}
              </div>

              <div className="mt-6 border-t border-[#E2DDD4] pt-5 dark:border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#5C5851] dark:text-[#8F9A8A]">What's Included</p>
                <div className="mt-3 space-y-2.5">
                  {[
                    'Milestone 1 is free to start',
                    'AI tutor with message limits',
                    'Checkpoint quizzes',
                    'Full code access after unlock',
                  ].map((item) => (
                    <p key={item} className="flex items-center gap-2 text-sm font-semibold text-[#5C5851] dark:text-[#D9D2C7]">
                      <CheckCircle2 size={16} className="text-[#2A9D6F]" /> {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Rate Box */}
            <div className="rounded-2xl border border-[#E2DDD4] bg-white p-5 shadow-[0_8px_30px_rgba(28,26,23,0.04)] dark:border-white/10 dark:bg-[#171B16]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4840A]">Feedback</p>
              <h2 className="mt-1 font-headline text-xl font-semibold">Rate this build</h2>
              <form onSubmit={handleRateProject} className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRatingValue(value)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                        value <= ratingValue
                          ? 'border-[#D4840A] bg-[#FEF3DC] text-[#92580A] dark:border-[#F0C565] dark:bg-[#3A2A12] dark:text-[#FFD98A]'
                          : 'border-[#E2DDD4] bg-[#F6F4EF] text-[#9B9589] hover:border-[#D4840A] dark:border-white/10 dark:bg-[#10130F] dark:text-[#8F9A8A]'
                      }`}
                      aria-label={`${value} star rating`}
                    >
                      <Star size={15} className={value <= ratingValue ? 'fill-current' : ''} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={ratingComment}
                  onChange={(event) => setRatingComment(event.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="Optional note for future learners..."
                  className="w-full resize-none rounded-xl border border-[#E2DDD4] bg-[#F6F4EF] p-3 text-sm font-semibold outline-none transition focus:border-[#1E3A2F] focus:ring-4 focus:ring-[#1E3A2F]/10 dark:border-white/10 dark:bg-[#10130F]"
                />
                <button
                  type="submit"
                  disabled={submittingRating}
                  className="w-full rounded-lg bg-[#1E3A2F] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#2D5C42] disabled:opacity-60 dark:bg-[#7FC79C] dark:text-[#07130B] dark:hover:bg-[#9DE6B8]"
                >
                  {submittingRating ? 'Saving...' : 'Save rating'}
                </button>
              </form>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
