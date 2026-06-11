import uuid
from datetime import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    external_customer_id: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    full_name: Mapped[str | None] = mapped_column(String(255))
    phone_e164: Mapped[str | None] = mapped_column(String(20), unique=True)
    city: Mapped[str | None] = mapped_column(String(120))
    state: Mapped[str | None] = mapped_column(String(120))
    prime_member_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    customer_tier: Mapped[str | None] = mapped_column(String(50))
    is_at_risk_customer: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_lost_customer: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    churn_score: Mapped[float | None] = mapped_column(Float)
    raw_profile: Mapped[dict | None] = mapped_column(JSONB)

    orders: Mapped[list["Order"]] = relationship(back_populates="user")
    wishlist_items: Mapped[list["WishlistItem"]] = relationship(back_populates="user")
    search_events: Mapped[list["SearchEvent"]] = relationship(back_populates="user")
    user_tags: Mapped[list["UserTag"]] = relationship(back_populates="user")
    recommendation_impressions: Mapped[list["RecommendationImpression"]] = relationship(back_populates="user")
    ad_impressions: Mapped[list["AdImpression"]] = relationship(back_populates="user")
    survey_responses: Mapped[list["SurveyResponse"]] = relationship(back_populates="user")
    reward_ledger_entries: Mapped[list["RewardPointsLedger"]] = relationship(back_populates="user")
    outbound_notifications: Mapped[list["OutboundNotification"]] = relationship(back_populates="user")


class Order(TimestampMixin, Base):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    order_number: Mapped[str | None] = mapped_column(String(100), unique=True)
    ordered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status: Mapped[str | None] = mapped_column(String(50))
    total_amount: Mapped[float | None] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(3), default="INR", nullable=False)
    raw_payload: Mapped[dict | None] = mapped_column(JSONB)

    user: Mapped["User"] = relationship(back_populates="orders")


class WishlistItem(TimestampMixin, Base):
    __tablename__ = "wishlist_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_external_id: Mapped[str] = mapped_column(String(120), nullable=False)
    added_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    removed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    raw_payload: Mapped[dict | None] = mapped_column(JSONB)

    user: Mapped["User"] = relationship(back_populates="wishlist_items")


class SearchEvent(TimestampMixin, Base):
    __tablename__ = "search_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    query_text: Mapped[str] = mapped_column(String(500), nullable=False)
    searched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    result_count: Mapped[int | None] = mapped_column(Integer)
    clicked_product_external_id: Mapped[str | None] = mapped_column(String(120))
    raw_payload: Mapped[dict | None] = mapped_column(JSONB)

    user: Mapped["User"] = relationship(back_populates="search_events")


class UserTag(TimestampMixin, Base):
    __tablename__ = "user_tags"
    __table_args__ = (
        UniqueConstraint("user_id", "tag_key", "tag_value", "source", name="uq_user_tag_source_value"),
        Index("ix_user_tags_user_score", "user_id", "score"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    tag_key: Mapped[str] = mapped_column(String(100), nullable=False)
    tag_value: Mapped[str] = mapped_column(String(255), nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    source: Mapped[str] = mapped_column(String(30), nullable=False, default="rule")
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    metadata_json: Mapped[dict | None] = mapped_column(JSONB)

    user: Mapped["User"] = relationship(back_populates="user_tags")


class Product(TimestampMixin, Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    external_product_id: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(1000), nullable=False)
    brand: Mapped[str | None] = mapped_column(String(120))
    category: Mapped[str | None] = mapped_column(String(120))
    subcategory: Mapped[str | None] = mapped_column(String(120))
    price: Mapped[float | None] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(3), default="INR", nullable=False)
    rating: Mapped[float | None] = mapped_column(Float)
    review_count: Mapped[int | None] = mapped_column(Integer)
    source: Mapped[str] = mapped_column(String(30), default="seed", nullable=False)
    is_sponsored: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    raw_payload: Mapped[dict | None] = mapped_column(JSONB)
    last_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    embeddings: Mapped[list["ProductVector"]] = relationship(back_populates="product")
    recommendation_impressions: Mapped[list["RecommendationImpression"]] = relationship(back_populates="product")


class ProductVector(TimestampMixin, Base):
    __tablename__ = "product_vectors"
    __table_args__ = (
        UniqueConstraint("product_id", "model_name", "embedding_version", name="uq_product_model_version"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    model_name: Mapped[str] = mapped_column(String(120), nullable=False, default="all-MiniLM-L6-v2")
    embedding_version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    embedding: Mapped[list[float]] = mapped_column(Vector(384), nullable=False)

    product: Mapped["Product"] = relationship(back_populates="embeddings")


class RecommendationImpression(Base):
    __tablename__ = "recommendation_impressions"
    __table_args__ = (
        Index("ix_recommendation_impressions_user_context", "user_id", "context", "shown_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    query_text: Mapped[str | None] = mapped_column(String(500))
    context: Mapped[str] = mapped_column(String(40), nullable=False, default="search")
    rank_position: Mapped[int] = mapped_column(Integer, nullable=False)
    score: Mapped[float | None] = mapped_column(Float)
    explanation: Mapped[str | None] = mapped_column(Text)
    shown_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    clicked: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    clicked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    metadata_json: Mapped[dict | None] = mapped_column(JSONB)

    user: Mapped["User"] = relationship(back_populates="recommendation_impressions")
    product: Mapped["Product"] = relationship(back_populates="recommendation_impressions")


class AdCreative(TimestampMixin, Base):
    __tablename__ = "ad_creatives"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(String(1024))
    target_url: Mapped[str | None] = mapped_column(String(1024))
    cta_text: Mapped[str | None] = mapped_column(String(120))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    starts_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    targeting_rules: Mapped[dict | None] = mapped_column(JSONB)

    ad_impressions: Mapped[list["AdImpression"]] = relationship(back_populates="ad_creative")


class AdImpression(Base):
    __tablename__ = "ad_impressions"
    __table_args__ = (
        Index("ix_ad_impressions_user_shown_at", "user_id", "shown_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ad_creative_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("ad_creatives.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    placement: Mapped[str] = mapped_column(String(60), nullable=False, default="homepage")
    rank_position: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    shown_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    clicked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    metadata_json: Mapped[dict | None] = mapped_column(JSONB)

    ad_creative: Mapped["AdCreative"] = relationship(back_populates="ad_impressions")
    user: Mapped["User"] = relationship(back_populates="ad_impressions")


class SurveyResponse(Base):
    __tablename__ = "survey_responses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    survey_key: Mapped[str] = mapped_column(String(120), nullable=False)
    answers: Mapped[dict] = mapped_column(JSONB, nullable=False)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    reward_points_awarded: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    ingested_to_tags: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    user: Mapped["User"] = relationship(back_populates="survey_responses")


class RewardPointsLedger(Base):
    __tablename__ = "reward_points_ledger"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    points_delta: Mapped[int] = mapped_column(Integer, nullable=False)
    balance_after: Mapped[int | None] = mapped_column(Integer)
    reason: Mapped[str] = mapped_column(String(255), nullable=False)
    reference_type: Mapped[str | None] = mapped_column(String(80))
    reference_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship(back_populates="reward_ledger_entries")


class CampaignRun(TimestampMixin, Base):
    __tablename__ = "campaign_runs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_type: Mapped[str] = mapped_column(String(80), nullable=False, default="winback")
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="draft")
    triggered_by: Mapped[str | None] = mapped_column(String(120))
    audience_query: Mapped[dict | None] = mapped_column(JSONB)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    summary: Mapped[dict | None] = mapped_column(JSONB)

    outbound_notifications: Mapped[list["OutboundNotification"]] = relationship(back_populates="campaign_run")


class OutboundNotification(TimestampMixin, Base):
    __tablename__ = "outbound_notifications"
    __table_args__ = (
        Index("ix_outbound_notifications_status", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_run_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("campaign_runs.id", ondelete="SET NULL"))
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    channel: Mapped[str] = mapped_column(String(30), nullable=False, default="whatsapp")
    template_id: Mapped[str | None] = mapped_column(String(160))
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="queued")
    provider_message_id: Mapped[str | None] = mapped_column(String(255))
    payload: Mapped[dict | None] = mapped_column(JSONB)
    error_message: Mapped[str | None] = mapped_column(Text)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    campaign_run: Mapped["CampaignRun"] = relationship(back_populates="outbound_notifications")
    user: Mapped["User"] = relationship(back_populates="outbound_notifications")
